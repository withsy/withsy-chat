import { Injectable } from "@nestjs/common";
import { AiTextSenderService } from "../ai-text-sender/ai-text-sender.service.js";
import { ChatMapper } from "../chat/chat-mapper.js";
import { ChatRepo } from "../chat/chat-repo.js";
import { DbService } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatModel } from "../generated/prisma/models.js";
import { IdempotencyKeyRepo } from "../idempotency-key/idempotency-key-repo.js";
import { UserId } from "../user/user-schemas.js";
import { ChatMessageMapper } from "./chat-message-mapper.js";
import { ChatMessageRepo } from "./chat-message-repo.js";
import {
  ChatMessageList,
  ChatMessageListOutput,
  ChatMessageSend,
  ChatMessageSendOutput,
} from "./chat-message-schemas.js";

@Injectable()
export class ChatMessageService {
  constructor(
    private readonly dbService: DbService,
    private readonly e8nService: E8nService,
    private readonly chatMapper: ChatMapper,
    private readonly chatMessageMapper: ChatMessageMapper,
    private readonly aiTextSenderService: AiTextSenderService,
  ) {}

  async list(
    userId: UserId,
    input: ChatMessageList,
  ): Promise<ChatMessageListOutput> {
    const chatMessageRepo = new ChatMessageRepo(this.dbService.db);
    const { entities, nextCursor } = await chatMessageRepo.list(userId, input);
    const items = entities.map((entity) =>
      this.chatMessageMapper.toData(entity),
    );

    return {
      items,
      nextCursor,
    };
  }

  async send(
    userId: UserId,
    input: ChatMessageSend,
  ): Promise<ChatMessageSendOutput> {
    const { idempotencyKey, text, model } = input;

    const txResult = await this.dbService.db.$transaction(async (tx) => {
      const idempotencyKeyRepo = new IdempotencyKeyRepo(tx);
      await idempotencyKeyRepo.create({
        idempotencyKey,
      });

      const chatRepo = new ChatRepo(tx);

      let chat: ChatModel | null = null;
      let chatId: string = "";
      if (!input.chatId) {
        const title = [...text].slice(0, 20).join("");
        chat = await chatRepo.create(
          {
            e8nService: this.e8nService,
          },
          userId,
          {
            title,
          },
        );
        chatId = chat.id;
      } else {
        chatId = input.chatId;
      }

      const chatMessageRepo = new ChatMessageRepo(tx);

      const userChatMessage = await chatMessageRepo.createForUser(
        {
          e8nService: this.e8nService,
        },
        {
          chatId,
          text,
        },
      );

      const modelChatMessage = await chatMessageRepo.createForModel(
        {
          e8nService: this.e8nService,
        },
        {
          chatId,
          model,
        },
      );

      return {
        chat,
        chatId,
        userChatMessage,
        modelChatMessage,
      };
    });

    const chat = txResult.chat ? this.chatMapper.toData(txResult.chat) : null;
    const userChatMessage = this.chatMessageMapper.toData(
      txResult.userChatMessage,
    );
    const modelChatMessage = this.chatMessageMapper.toData(
      txResult.modelChatMessage,
    );

    this.aiTextSenderService.send({
      userId,
      chatId: txResult.chatId,
      userChatMessageId: txResult.userChatMessage.id,
      modelChatMessageId: txResult.modelChatMessage.id,
    });

    return {
      chat,
      userChatMessage,
      modelChatMessage,
    };
  }
}

import { Injectable } from "@nestjs/common";
import { AiRouterService } from "../ai-router/ai-router.service.js";
import { ChatE8nRepo } from "../chat/chat-e8n-repo.js";
import { ChatMapper } from "../chat/chat-mapper.js";
import { DbService } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatModel } from "../generated/prisma/models.js";
import { IdempotencyKeyRepo } from "../idempotency-key/idempotency-key-repo.js";
import { UserId } from "../user/user-schemas.js";
import { ChatMessageE8nRepo } from "./chat-message-e8n-repo.js";
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
    private readonly aiRouterService: AiRouterService,
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

      const chatE8nRepo = new ChatE8nRepo(tx, this.e8nService);

      let chat: ChatModel | null = null;
      let chatId: string = "";
      if (!input.chatId) {
        const title = [...text].slice(0, 20).join("");
        chat = await chatE8nRepo.create(userId, {
          title,
        });
        chatId = chat.id;
      } else {
        chatId = input.chatId;
      }

      const chatMessageE8nRepo = new ChatMessageE8nRepo(tx, this.e8nService);

      const userChatMessage = await chatMessageE8nRepo.createForUser({
        chatId,
        textEncrypted: this.e8nService.encrypt(text),
      });

      const modelChatMessage = await chatMessageE8nRepo.createForModel({
        chatId,
        model,
      });

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

    this.aiRouterService.send({
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

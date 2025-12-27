import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { ChatE8nRepo } from "../chat/chat-e8n-repo.js";
import { ChatEntityMapper } from "../chat/chat-entity-mapper.js";
import { DbService } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatModel } from "../generated/prisma/models.js";
import { IdempotencyKeyRepo } from "../idempotency-key/idempotency-key-repo.js";
import { UserId } from "../user/user-schemas.js";
import { ChatMessageE8nRepo } from "./chat-message-e8n-repo.js";
import { ChatMessageEntityMapper } from "./chat-message-entity-mapper.js";
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
    private readonly chatEntityMapper: ChatEntityMapper,
    private readonly chatMessageEntityMapper: ChatMessageEntityMapper,
  ) {}

  list(userId: UserId, input: ChatMessageList): Promise<ChatMessageListOutput> {
    throw new Error();
  }

  async send(
    userId: UserId,
    input: ChatMessageSend,
  ): Promise<ChatMessageSendOutput> {
    const { idempotencyKey, text } = input;

    const txResult = await this.dbService.db.$transaction(async (tx) => {
      const idempotencyKeyRepo = new IdempotencyKeyRepo(tx);
      await idempotencyKeyRepo.create({
        idempotencyKey,
      });

      const chatE8nRepo = new ChatE8nRepo(tx, this.e8nService);

      let chat: ChatModel | null = null;
      let chatId: string = "";
      if (!input.chatId) {
        const { type } = input;

        if (!type) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid type.",
          });
        }

        const title = [...text].slice(0, 20).join("");
        chat = await chatE8nRepo.create(userId, {
          type,
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
      });

      return {
        chat,
        userChatMessage,
        modelChatMessage,
      };
    });

    const chat = txResult.chat
      ? this.chatEntityMapper.toData(txResult.chat)
      : null;
    const userChatMessage = this.chatMessageEntityMapper.toData(
      txResult.userChatMessage,
    );
    const modelChatMessage = this.chatMessageEntityMapper.toData(
      txResult.modelChatMessage,
    );

    // TODO: send message to ai.

    return {
      chat,
      userChatMessage,
      modelChatMessage,
    };
  }
}

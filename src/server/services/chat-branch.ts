import * as Chat from "@/types/chat";
import type * as ChatBranch from "@/types/chat-branch";
import type { UserId } from "@/types/id";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";

export class ChatBranchService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId, input: ChatBranch.List): Promise<Chat.ListOutout> {
    const { chatId } = input;

    const entities = await this.service.db.chat.findMany({
      where: { parentMessage: { chatId }, userId, deletedAt: null },
      select: Chat.Select,
    });

    const datas = entities.map((x) => this.service.chat.decrypt(x));
    return datas;
  }

  async start(userId: UserId, input: ChatBranch.Start): Promise<Chat.Data> {
    const { idempotencyKey, messageId } = input;

    const parentMessage = await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const parentMessage = await MessageService.get(tx, {
        userId,
        messageId,
      });

      return parentMessage;
    });

    const parentMessageData = this.service.message.decrypt(parentMessage);
    const title = [...parentMessageData.text].slice(0, 20).join("");
    const titleEncrypted = this.service.encryption.encrypt(title);

    const chat = await this.service.db.$transaction(async (tx) => {
      const chat = await ChatService.createBranchChat(tx, {
        userId,
        parentMessageId: parentMessage.id,
        titleEncrypted,
      });

      return chat;
    });

    const data = this.service.chat.decrypt(chat);
    return data;
  }
}

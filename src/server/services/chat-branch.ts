import { ChatListOutout, ChatSelect, type ChatData } from "@/types/chat";
import type { ChatBranchList, ChatBranchStart } from "@/types/chat-branch";
import type { UserId } from "@/types/id";
import { ChatService } from "./chat";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { inject } from "../service-registry";

export class ChatBranchService {
  private readonly db = inject("db");
  private readonly chat = inject("chat");
  private readonly message = inject("message");
  private readonly encryption = inject("encryption");

  async list(userId: UserId, input: ChatBranchList): Promise<ChatListOutout> {
    const { chatId } = input;

    const entities = await this.db.chat.findMany({
      where: { parentMessage: { chatId }, userId, deletedAt: null },
      select: ChatSelect,
    });

    const datas = entities.map((x) => this.chat.decrypt(x));
    return datas;
  }

  async start(userId: UserId, input: ChatBranchStart): Promise<ChatData> {
    const { idempotencyKey, messageId } = input;

    const parentMessage = await this.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const parentMessage = await MessageService.get(tx, {
        userId,
        messageId,
      });

      return parentMessage;
    });

    const parentMessageData = this.message.decrypt(parentMessage);
    const title = [...parentMessageData.text].slice(0, 20).join("");
    const titleEncrypted = this.encryption.encrypt(title);

    const chat = await this.db.$transaction(async (tx) => {
      const chat = await ChatService.createBranchChat(tx, {
        userId,
        parentMessageId: parentMessage.id,
        titleEncrypted,
      });

      return chat;
    });

    const data = this.chat.decrypt(chat);
    return data;
  }
}

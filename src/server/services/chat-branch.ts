import { ChatListOutout, ChatSelect, type ChatData } from "@/types/chat";
import type { ChatBranchList, ChatBranchStart } from "@/types/chat-branch";
import type { UserId } from "@/types/id";
import { ChatService } from "./chat";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import type { Db } from "./db";
import type { EncryptionService } from "./encryption";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";

export class ChatBranchService {
  constructor(
    private readonly db: Db,
    private readonly encryptionService: EncryptionService,
    private readonly chatMessageDecryptService: ChatMessageDecryptService
  ) {}

  async list(userId: UserId, input: ChatBranchList): Promise<ChatListOutout> {
    const { chatId } = input;

    const entities = await this.db.chat.findMany({
      where: { parentMessage: { chatId }, userId, deletedAt: null },
      select: ChatSelect,
    });

    const datas = entities.map((x) =>
      this.chatMessageDecryptService.decryptChat(x)
    );
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

    const parentMessageData =
      this.chatMessageDecryptService.decryptMessage(parentMessage);
    const title = [...parentMessageData.text].slice(0, 20).join("");
    const titleEncrypted = this.encryptionService.encrypt(title);

    const chat = await this.db.$transaction(async (tx) => {
      const chat = await ChatService.createBranchChat(tx, {
        userId,
        parentMessageId: parentMessage.id,
        titleEncrypted,
      });

      return chat;
    });

    const data = this.chatMessageDecryptService.decryptChat(chat);
    return data;
  }
}

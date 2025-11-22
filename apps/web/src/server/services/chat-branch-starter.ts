import type { ChatData } from "@/types/chat";
import type { ChatBranchStart } from "@/types/chat-branch";
import type { UserId } from "@/types/id";
import { ChatService } from "../chat/chat.service";
import type { EncryptionService } from "../encryption/encryption.service";
import { MessageService } from "../message/message.service";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";
import type { Db } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";

export class ChatBranchStarter {
  constructor(
    private readonly db: Db,
    private readonly chatMessageDecryptService: ChatMessageDecryptService,
    private readonly encryptionService: EncryptionService
  ) {}

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

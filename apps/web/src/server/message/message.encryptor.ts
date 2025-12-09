import type { MessageData } from "@/types/message";
import { Role } from "@/types/role";
import type { EncryptionService } from "../encryption/encryption.service";
import type { MessageModel } from "../generated/prisma/models";

export class MessageEncryptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  decryptMessage(entity: MessageModel): MessageData {
    const text = this.encryptionService.decrypt(entity.textEncrypted);
    const reasoningText = this.encryptionService.decrypt(
      entity.reasoningTextEncrypted
    );
    const data: MessageData = {
      id: entity.id,
      chatId: entity.chatId,
      role: Role.parse(entity.role),
      model: entity.model,
      status: entity.status,
      isBookmarked: entity.isBookmarked,
      createdAt: entity.createdAt,
      parentMessageId: entity.parentMessageId,
      text,
      reasoningText,
    };
    return data;
  }
}

import type { ChatData, ChatEntity } from "@/types/chat";
import type { MessageData, MessageEntity } from "@/types/message";
import { Model } from "@/types/model";
import { Role } from "@/types/role";
import type { UserPromptEntity } from "@/types/user-prompt";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserPromptService } from "../user-prompt/user-prompt.service";

export class ChatMessageDecryptService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly userPromptService: UserPromptService
  ) {}

  decryptChat(
    entity: ChatEntity & {
      parentMessage?: MessageEntity | null;
      userPrompt?: UserPromptEntity | null;
    }
  ): ChatData {
    const title = this.encryptionService.decrypt(entity.titleEncrypted);
    const data = {
      id: entity.id,
      title,
      isStarred: entity.isStarred,
      type: entity.type,
      parentMessageId: entity.parentMessageId,
      parentMessage: entity.parentMessage
        ? this.decryptMessage(entity.parentMessage)
        : null,
      updatedAt: entity.updatedAt,
      userPromptId: entity.userPromptId,
      userPrompt: entity.userPrompt
        ? this.userPromptService.decrypt(entity.userPrompt)
        : null,
    } satisfies ChatData;
    return data;
  }

  decryptMessage(entity: MessageEntity): MessageData {
    const text = this.encryptionService.decrypt(entity.textEncrypted);
    const reasoningText = this.encryptionService.decrypt(
      entity.reasoningTextEncrypted
    );
    const data = {
      id: entity.id,
      chatId: entity.chatId,
      role: Role.parse(entity.role),
      model: entity.model ? Model.parse(entity.model) : null,
      text,
      reasoningText,
      status: entity.status,
      isBookmarked: entity.isBookmarked,
      createdAt: entity.createdAt,
      parentMessageId: entity.parentMessageId,
    } satisfies MessageData;
    return data;
  }
}

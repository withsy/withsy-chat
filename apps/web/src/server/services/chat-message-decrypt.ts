import type { ChatData, ChatEntity } from "@/types/chat";
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
}

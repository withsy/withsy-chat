import type { UserPromptData } from "@/types/user-prompt";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserPromptModel } from "../generated/prisma/models";

export class UserPromptDecryptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  decrypt(entity: UserPromptModel): UserPromptData {
    const title = this.encryptionService.decrypt(entity.titleEncrypted);
    const text = this.encryptionService.decrypt(entity.textEncrypted);

    const data: UserPromptData = {
      id: entity.id,
      title,
      text,
      isStarred: entity.isStarred,
      updatedAt: entity.updatedAt,
    };

    return data;
  }
}

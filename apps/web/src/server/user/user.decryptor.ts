import { UserPreferences, type UserData } from "@/types/user";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserModel } from "../generated/prisma/models";

export class UserDecryptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  decryptUser(entity: UserModel): UserData {
    const name = this.encryptionService.decrypt(entity.nameEncrypted);
    const email = this.encryptionService.decrypt(entity.emailEncrypted);
    const imageUrl = this.encryptionService.decrypt(entity.imageUrlEncrypted);
    const preferences = UserPreferences.parse(entity.preferences);
    const data: UserData = {
      id: entity.id,
      name,
      email,
      imageUrl,
      aiLanguage: entity.aiLanguage,
      timezone: entity.timezone,
      preferences,
    };
    return data;
  }
}

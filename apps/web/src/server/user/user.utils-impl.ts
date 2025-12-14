import { UserPreferences, type UserData } from "@/types/user";
import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserModel } from "../generated/prisma/models";
import { UserService } from "./user.service";

export function createService(context: {
  encryptionService: EncryptionService;
  db: Db;
}): UserService {
  const { encryptionService, db } = context;

  return new UserService(encryptionService, db);
}

export function createEntityToData(
  encryptionService: EncryptionService
): (entity: UserModel) => UserData {
  return (entity) => {
    const name = encryptionService.decrypt(entity.nameEncrypted);
    const email = encryptionService.decrypt(entity.emailEncrypted);
    const imageUrl = encryptionService.decrypt(entity.imageUrlEncrypted);
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
  };
}

import type { UserPromptData } from "@/types/user-prompt";
import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserPromptModel } from "../generated/prisma/models";
import { UserPromptService } from "./user-prompt.service";

export function createService(context: {
  encryptionService: EncryptionService;
  db: Db;
}): UserPromptService {
  const { encryptionService, db } = context;

  return new UserPromptService(encryptionService, db);
}

export function entityToData(
  context: { encryptionService: EncryptionService },
  entity: UserPromptModel
): UserPromptData {
  const { encryptionService } = context;

  const title = encryptionService.decrypt(entity.titleEncrypted);
  const text = encryptionService.decrypt(entity.textEncrypted);

  const data: UserPromptData = {
    id: entity.id,
    title,
    text,
    isStarred: entity.isStarred,
    updatedAt: entity.updatedAt,
  };

  return data;
}

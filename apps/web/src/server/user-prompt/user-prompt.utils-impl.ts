import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import { UserPromptService } from "./user-prompt.service";

export function createService(context: {
  encryptionService: EncryptionService;
  db: Db;
}): UserPromptService {
  const { encryptionService, db } = context;

  return new UserPromptService(encryptionService, db);
}

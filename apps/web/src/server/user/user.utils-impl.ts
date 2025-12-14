import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import { UserService } from "./user.service";

export function createService(context: {
  encryptionService: EncryptionService;
  db: Db;
}): UserService {
  const { encryptionService, db } = context;

  return new UserService(encryptionService, db);
}

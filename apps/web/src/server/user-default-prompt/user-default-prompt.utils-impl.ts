import type { Db } from "../db/db";
import { UserDefaultPromptService } from "./user-default-prompt.service";

export function createService(context: { db: Db }): UserDefaultPromptService {
  const { db } = context;

  return new UserDefaultPromptService(db);
}

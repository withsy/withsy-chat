import type { ServerContext } from "../server-context";
import { UserPromptService } from "./user-prompt.service";

export function createService(context: ServerContext): UserPromptService {
  const { encryptionService, db } = context;

  return new UserPromptService(encryptionService, db);
}

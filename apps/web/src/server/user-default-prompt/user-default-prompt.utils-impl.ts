import type { ServerContext } from "../server-context";
import { UserDefaultPromptService } from "./user-default-prompt.service";

export function createService(
  context: ServerContext
): UserDefaultPromptService {
  const { db } = context;

  return new UserDefaultPromptService(db);
}

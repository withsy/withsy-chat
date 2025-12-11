import type { ServerContext } from "../server-context";
import { UserPromptService } from "./user-prompt.service";

export class UserPromptServiceFactory {
  constructor(private readonly serverContext: ServerContext) {}

  create(): UserPromptService {
    const { encryptionService, db } = this.serverContext;

    return new UserPromptService(encryptionService, db);
  }
}

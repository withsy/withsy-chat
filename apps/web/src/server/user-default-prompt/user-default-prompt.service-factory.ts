import type { ServerContext } from "../server-context";
import { UserDefaultPromptService } from "./user-default-prompt.service";

export class UserDefaultPromptServiceFactory {
  constructor(private readonly serverContext: ServerContext) {}

  create(): UserDefaultPromptService {
    const { db } = this.serverContext;

    return new UserDefaultPromptService(db);
  }
}

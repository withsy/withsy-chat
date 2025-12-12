import type { ServerContext } from "../server-context";
import { UserAiProfileService } from "./user-ai-profile.service";

export class UserAiProfileServiceFactory {
  constructor(private readonly serverContext: ServerContext) {}

  create(): UserAiProfileService {
    const { encryptionService, db } = this.serverContext;

    return new UserAiProfileService(encryptionService, db);
  }
}

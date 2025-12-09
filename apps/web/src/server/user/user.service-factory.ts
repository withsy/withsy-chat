import type { ServerContext } from "../server-context";
import { UserService } from "./user.service";

export class UserServiceFactory {
  constructor(private readonly serverContext: ServerContext) {}

  createUserService(): UserService {
    const { encryptionService, db } = this.serverContext;
    return new UserService(encryptionService, db);
  }
}

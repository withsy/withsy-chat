import type { ServerContext } from "../server-context";
import { UserUsageLimitService } from "./user-usage-limit.service";

export class UserUsageLimitServiceFactory {
  constructor(private readonly serverContext: ServerContext) {}

  create(): UserUsageLimitService {
    const { db } = this.serverContext;

    return new UserUsageLimitService(db);
  }
}

import type { ServerContext } from "../server-context";
import { UserUsageLimitService } from "./user-usage-limit.service";

export function createService(context: ServerContext): UserUsageLimitService {
  const { db } = context;

  return new UserUsageLimitService(db);
}

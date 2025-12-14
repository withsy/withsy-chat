import type { ServerContext } from "../server-context";
import { UserService } from "./user.service";

export function createService(context: ServerContext): UserService {
  const { encryptionService, db } = context;

  return new UserService(encryptionService, db);
}

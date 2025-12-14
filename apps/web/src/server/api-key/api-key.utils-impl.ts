import type { Db } from "../db/db";
import { ApiKeyService } from "./api-key.service";

export function createService(context: { db: Db }): ApiKeyService {
  const { db } = context;

  return new ApiKeyService(db);
}

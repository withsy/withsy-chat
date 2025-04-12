import type { IdempotencyKey } from "@/types/common";
import { TRPCError } from "@trpc/server";
import type { Db } from "./db";
import type { ServiceRegistry } from "./global";

export const DUPLICATE_REQUEST_ERROR = new TRPCError({
  code: "CONFLICT",
  message: "Duplicate request",
});

export class IdempotencyService {
  constructor(private readonly s: ServiceRegistry) {}

  async checkDuplicateRequest(idempotencyKey: IdempotencyKey) {
    return await IdempotencyService.checkDuplicateRequest(
      this.s.get("db"),
      idempotencyKey
    );
  }

  static async checkDuplicateRequest(db: Db, idempotencyKey: IdempotencyKey) {
    return await db
      .insertInto("idempotencyKeys")
      .values({ key: idempotencyKey })
      .onConflict((oc) => oc.doNothing())
      .returning("key")
      .executeTakeFirstOrThrow(() => DUPLICATE_REQUEST_ERROR);
  }
}

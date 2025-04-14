import type { IdempotencyKey } from "@/types/common";
import { TRPCError } from "@trpc/server";
import type { Db } from "./db";
import type { ServiceMap } from "./service-map";

export const DUPLICATE_REQUEST_ERROR = new TRPCError({
  code: "CONFLICT",
  message: "Duplicate request",
});

export class IdempotencyService {
  constructor(private readonly s: ServiceMap) {}

  async checkDuplicateRequest(idempotencyKey: IdempotencyKey) {
    return await IdempotencyService.checkDuplicateRequest(
      this.s.db,
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

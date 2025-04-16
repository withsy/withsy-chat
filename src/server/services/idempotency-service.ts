import type { IdempotencyKey } from "@/types/common";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Db } from "./db";

export class IdempotencyService {
  constructor(private readonly s: ServiceRegistry) {}

  async checkDuplicateRequest(idempotencyKey: IdempotencyKey) {
    const row = await IdempotencyService.checkDuplicateRequest(
      this.s.db,
      idempotencyKey
    );
    return row;
  }

  static async checkDuplicateRequest(db: Db, idempotencyKey: IdempotencyKey) {
    const row = await db
      .insertInto("idempotencyKeys")
      .values({ key: idempotencyKey })
      .onConflict((oc) => oc.doNothing())
      .returning(["key"])
      .executeTakeFirstOrThrow(
        () =>
          new HttpServerError(StatusCodes.CONFLICT, "Duplicate request", {
            extra: {
              idempotencyKey,
            },
          })
      );
    return row;
  }
}

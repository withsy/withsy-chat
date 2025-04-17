import { type IdempotencyKey } from "@/types/idempotency";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Db } from "./db";

export class IdempotencyInfoService {
  constructor(private readonly service: ServiceRegistry) {}

  async checkDuplicateRequest(idempotencyKey: IdempotencyKey) {
    const res = await IdempotencyInfoService.checkDuplicateRequest(
      this.service.db,
      idempotencyKey
    );

    return res;
  }

  static async checkDuplicateRequest(db: Db, idempotencyKey: IdempotencyKey) {
    const res = await db
      .insertInto("idempotencyInfos")
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

    return res;
  }
}

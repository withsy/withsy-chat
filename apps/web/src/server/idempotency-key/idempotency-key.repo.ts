import type { IdempotencyKey } from "@/types/idempotency";
import { TRPCError } from "@trpc/server";
import type { Tx } from "../db/db";
import { DataError, isExpectedUniqueConstraintViolation } from "../error";
import type { IdempotencyKeyModel } from "../generated/prisma/models";

export class IdempotencyKeyRepo {
  constructor(private readonly tx: Tx) {}

  async tryCreate(input: {
    idempotencyKey: IdempotencyKey;
  }): Promise<IdempotencyKeyModel | null> {
    const { idempotencyKey } = input;

    try {
      const entity = await this.tx.idempotencyKey.create({
        data: {
          idempotencyKey,
        },
      });

      return entity;
    } catch (e) {
      if (isExpectedUniqueConstraintViolation(e, ["idempotency_key"])) {
        return null;
      }

      throw e;
    }
  }

  async check(input: {
    idempotencyKey: IdempotencyKey;
  }): Promise<IdempotencyKeyModel> {
    const { idempotencyKey } = input;

    const entity = await this.tryCreate({
      idempotencyKey,
    });
    if (!entity) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Duplicate idempotency key.",
        cause: new DataError({ idempotencyKey }),
      });
    }

    return entity;
  }
}

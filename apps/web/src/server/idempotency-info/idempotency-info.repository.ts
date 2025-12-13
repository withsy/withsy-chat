import type { IdempotencyKey } from "@/types/idempotency";
import { TRPCError } from "@trpc/server";
import type { Tx } from "../db/db";
import { DataError, isExpectedUniqueConstraintViolation } from "../error";
import type { IdempotencyInfoModel } from "../generated/prisma/models";

export class IdempotencyInfoRepository {
  constructor(private readonly tx: Tx) {}

  async tryCreate(input: {
    idempotencyKey: IdempotencyKey;
  }): Promise<IdempotencyInfoModel | null> {
    const { idempotencyKey } = input;

    try {
      const entity = await this.tx.idempotencyInfo.create({
        data: {
          key: idempotencyKey,
        },
      });

      return entity;
    } catch (e) {
      if (isExpectedUniqueConstraintViolation(e, ["key"])) {
        return null;
      }

      throw e;
    }
  }

  async createOrThrow(input: {
    idempotencyKey: IdempotencyKey;
  }): Promise<IdempotencyInfoModel> {
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

import { TRPCError } from "@trpc/server";
import { Tx } from "src/db/db.host";
import { DataError, isExpectedUniqueConstraintViolation } from "../error";
import type { IdempotencyKeyModel } from "../generated/prisma/models";
import { IdempotencyKey } from "./idempotency-key-schemas";

export class IdempotencyKeyRepo {
  constructor(private readonly tx: Tx) {}

  private async tryCreate(input: {
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

  async create(input: { idempotencyKey: IdempotencyKey }): Promise<void> {
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
  }
}

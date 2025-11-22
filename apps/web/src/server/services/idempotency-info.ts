import type { IdempotencyKey } from "@/types/id";
import { idempotencyInfoSelect } from "@/types/idempotency";
import type { Db, Tx } from "./db";
import { TRPCError } from "@trpc/server";
import { Prisma } from "../generated/prisma/client";

export class IdempotencyInfoService {
  constructor(private readonly db: Db) {}

  async checkDuplicateRequest(idempotencyKey: IdempotencyKey) {
    const res = await IdempotencyInfoService.checkDuplicateRequest(
      this.db,
      idempotencyKey
    );
    return res;
  }

  static async checkDuplicateRequest(tx: Tx, idempotencyKey: IdempotencyKey) {
    try {
      const res = await tx.idempotencyInfo.create({
        data: {
          key: idempotencyKey,
        },
        select: idempotencyInfoSelect,
      });

      return res;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Duplicate request.",
          cause: { idempotencyKey },
        });
      }

      throw e;
    }
  }
}

import type { IdempotencyKey } from "@/types/id";
import { idempotencyInfoSelect } from "@/types/idempotency";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { TrpcDataError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class IdempotencyInfoService {
  constructor(private readonly service: ServiceRegistry) {}

  async checkDuplicateRequest(idempotencyKey: IdempotencyKey) {
    const res = await IdempotencyInfoService.checkDuplicateRequest(
      this.service.db,
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
          cause: new TrpcDataError({
            idempotencyKey,
          }),
        });
      }

      throw e;
    }
  }
}

import { type IdempotencyKey } from "@/types/idempotency";
import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Db, Tx } from "./db";

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
      const res = await tx.idempotencyInfos.create({
        data: {
          key: idempotencyKey,
        },
        select: {
          key: true,
        },
      });

      return res;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new HttpServerError(StatusCodes.CONFLICT, "Duplicate request", {
          extra: {
            idempotencyKey,
          },
        });
      }

      throw e;
    }
  }
}

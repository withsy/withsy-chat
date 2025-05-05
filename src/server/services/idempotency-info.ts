import type { IdempotencyKey } from "@/types/id";
import { idempotencyInfoSelect } from "@/types/idempotency";
import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
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
        throw new HttpServerError(StatusCodes.CONFLICT, "Duplicate request.", {
          details: {
            idempotencyKey,
          },
        });
      }

      throw e;
    }
  }
}

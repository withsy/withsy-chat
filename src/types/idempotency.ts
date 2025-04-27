import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./id";

export const idempotencyInfoSelect = {
  key: true,
} satisfies Prisma.IdempotencyInfoSelect;

export const IdempotencyInfo = z.object({
  key: IdempotencyKey,
});
export type IdempotencyInfo = zInfer<typeof IdempotencyInfo>;

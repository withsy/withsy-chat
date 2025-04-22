import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const idempotencyInfoSelect = {
  key: true,
} satisfies Prisma.IdempotencyInfoSelect;

export const IdempotencyKey = z.string().uuid();
export type IdempotencyKey = zInfer<typeof IdempotencyKey>;

export const IdempotencyInfo = z.object({
  key: IdempotencyKey,
});
export type IdempotencyInfo = zInfer<typeof IdempotencyInfo>;

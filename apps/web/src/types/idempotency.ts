import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./id";
import type { Prisma } from "@/server/generated/prisma/client";

export const idempotencyInfoSelect = {
  key: true,
} satisfies Prisma.IdempotencyInfoSelect;

export const IdempotencyInfo = z.object({
  key: IdempotencyKey,
});
export type IdempotencyInfo = zInfer<typeof IdempotencyInfo>;

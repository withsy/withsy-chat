import type { Prisma } from "@/server/generated/prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const idempotencyInfoSelect = {
  key: true,
} satisfies Prisma.IdempotencyInfoSelect;

export const IdempotencyInfo = z.object({
  get key() {
    return IdempotencyKey;
  },
});
export type IdempotencyInfo = zInfer<typeof IdempotencyInfo>;

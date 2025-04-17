import { z } from "zod";
import type { zInfer } from "./common";

export const IdempotencyKey = z.string().uuid();
export type IdempotencyKey = zInfer<typeof IdempotencyKey>;

export const IdempotencyInfo = z.object({
  key: IdempotencyKey,
});
export type IdempotencyInfo = zInfer<typeof IdempotencyInfo>;

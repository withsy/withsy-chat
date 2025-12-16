import z from "zod";

export const IdempotencyKey = z.uuid();
export type IdempotencyKey = z.infer<typeof IdempotencyKey>;

import type { Simplify } from "type-fest";
import { z, ZodType } from "zod";

export type MaybePromise<T> = Promise<T> | T;

export type zInfer<T extends ZodType> = Simplify<z.infer<T>>;
export type zInput<T extends ZodType> = Simplify<z.input<T>>;

export const JsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValue),
    z.record(JsonValue),
  ])
);
export type JsonValue = zInfer<typeof JsonValue>;

export const IdempotencyKey = z.string().uuid();
export type IdempotencyKey = zInfer<typeof IdempotencyKey>;

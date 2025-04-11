import type { Simplify } from "type-fest";
import { z } from "zod";

export type MaybePromise<T> = Promise<T> | T;

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
export type JsonValue = Simplify<z.infer<typeof JsonValue>>;

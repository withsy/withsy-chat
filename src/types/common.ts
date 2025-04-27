import type { Simplify } from "type-fest";
import { z, ZodType } from "zod";

export type MaybePromise<T> = Promise<T> | T;

export type zInfer<T extends ZodType> = Simplify<z.infer<T>>;
export type zInput<T extends ZodType> = Simplify<z.input<T>>;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };
export const JsonValueSchema: z.ZodType<JsonValue> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.lazy(() => JsonValueSchema.array()),
  z.lazy(() => z.record(JsonValueSchema)),
]);
export const JsonValue = JsonValueSchema;

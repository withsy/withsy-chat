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
export const JsonValueBase: z.ZodType<JsonValue> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.lazy(() => JsonValueBase)),
  z.record(z.lazy(() => JsonValueBase)),
]);
export const JsonValue = JsonValueBase;

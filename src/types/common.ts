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
export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema),
  ])
);
export const JsonValue = JsonValueSchema;

export function cols<S extends z.ZodObject<any>, Table extends string>(
  schema: S,
  table: Table
): Array<`${Table}.${Extract<keyof S["shape"], string>}`> {
  const keys = Object.keys(schema.shape) as Extract<keyof S["shape"], string>[];
  return keys.map((k) => `${table}.${k}` as `${Table}.${typeof k}`);
}

export function zParseDate() {
  return z.preprocess((x) => {
    if (typeof x === "string" || x instanceof Date) return new Date(x);
    throw new Error("Invalid time format.");
  }, z.date());
}

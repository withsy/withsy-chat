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

type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

type PrettyError<Message extends string> = { __error__: Message };

type HasExactKeys<T, U> = Exclude<keyof U, keyof T> extends infer Extra
  ? Extra extends never
    ? Exclude<RequiredKeys<T>, keyof U> extends infer Missing
      ? Missing extends never
        ? true
        : PrettyError<`❌ Missing required keys: ${Extract<Missing, string>}`>
      : never
    : PrettyError<`❌ Extra keys: ${Extract<Extra, string>}`>
  : never;

type IsArray<T> = T extends readonly any[] ? true : false;
type RejectArray<T> = IsArray<T> extends true
  ? { __error__: "❌ This is an array. Use checkExactKeysArray<T>() instead." }
  : unknown;

export function checkExactKeys<T>() {
  return <U>(
    value: U &
      RejectArray<U> &
      (HasExactKeys<T, U> extends true ? unknown : HasExactKeys<T, U>)
  ): U => value;
}

type AllHasExactKeys<
  T,
  U extends readonly unknown[]
> = U[number] extends infer Item
  ? HasExactKeys<T, Item> extends true
    ? true
    : HasExactKeys<T, Item>
  : false;

export function checkExactKeysArray<T>() {
  return <U extends readonly unknown[]>(
    value: U &
      (AllHasExactKeys<T, U> extends true ? unknown : AllHasExactKeys<T, U>)
  ): U => value;
}

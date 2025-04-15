import { z } from "zod";
import { JsonValue } from "./common";

export type Extra = Record<string, JsonValue>;

export type ApiErrorData = {
  code: number;
  name: string;
  message: string;
  stack?: string; // development only
  extra?: Extra;
  errors?: ApiErrorData[];
};

const ApiErrorDataSchema: z.ZodSchema<ApiErrorData> = z.lazy(() =>
  z.object({
    code: z.number().int(),
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
    extra: z.record(JsonValue).optional(),
    errors: z.array(ApiErrorDataSchema).optional(),
  })
);
export const ApiErrorData = ApiErrorDataSchema;

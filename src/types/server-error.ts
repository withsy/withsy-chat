import { z } from "zod";
import { JsonValue } from "./common";

export type Details = Record<string, JsonValue>;

export type Data = {
  code: number;
  type: string;
  message: string;
  stack?: string; // Excluded in production environments.
  cause?: unknown; // Excluded in production environments.
  details?: Details;
  errors?: Data[];
};

const DataBase: z.ZodSchema<Data> = z.object({
  code: z.number().int(),
  type: z.string(),
  message: z.string(),
  stack: z.optional(z.string()),
  cause: z.optional(z.unknown()),
  details: z.optional(z.record(JsonValue)),
  errors: z.optional(z.array(z.lazy(() => DataBase))),
});
export const Data = DataBase;

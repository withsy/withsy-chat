import { z } from "zod";
import { JsonValue } from "./common";

export type ServerErrorDetails = Record<string, JsonValue>;

export type ServerErrorData = {
  code: number;
  message: string;
  stack?: string; // Excluded in production environments.
  cause?: unknown; // Excluded in production environments.
  details?: ServerErrorDetails;
  errors?: ServerErrorData[];
};

const ServerErrorDataBase: z.ZodSchema<ServerErrorData> = z.object({
  code: z.number().int(),
  message: z.string(),
  stack: z.optional(z.string()),
  cause: z.optional(z.unknown()),
  details: z.optional(z.record(JsonValue)),
  errors: z.optional(z.array(z.lazy(() => ServerErrorDataBase))),
});
export const ServerErrorData = ServerErrorDataBase;

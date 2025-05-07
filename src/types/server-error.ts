import { z } from "zod";
import { JsonValue, type zInfer } from "./common";

export const ServerErrorDetails = z.record(JsonValue);
export type ServerErrorDetails = zInfer<typeof ServerErrorDetails>;

export const ServerErrorData = z.object({
  code: z.number().int(),
  message: z.string(),
  stack: z.optional(z.string()), // Excluded in production environments.
  cause: z.optional(z.unknown()), // Excluded in production environments.
  details: z.optional(ServerErrorDetails),
});
export type ServerErrorData = zInfer<typeof ServerErrorData>;

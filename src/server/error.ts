import type { ServerErrorData, ServerErrorDetails } from "@/types/server-error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { StatusCodes } from "http-status-codes";

export type ServerErrorOptions<
  TDetails extends ServerErrorDetails = ServerErrorDetails
> = {
  details?: TDetails;
  cause?: unknown;
};

export class ServerError<
    TDetails extends ServerErrorDetails = ServerErrorDetails,
    TCode extends number = number
  >
  extends Error
  implements ServerErrorData
{
  public details?: TDetails;

  constructor(
    public code: TCode,
    message: string,
    options?: ServerErrorOptions<TDetails>
  ) {
    super(message);
    if (options?.cause) this.cause = options.cause;
    if (options?.details) this.details = options.details;
  }

  toData(): ServerErrorData {
    const data: ServerErrorData = {
      code: this.code,
      message: this.message,
    };
    if (process.env.NODE_ENV !== "production") {
      if (this.stack) data.stack = this.stack;
      if (this.cause) data.cause = this.cause;
    }
    if (this.details) data.details = this.details;
    return data;
  }
}

export class HttpServerError<
  TDetails extends ServerErrorDetails = ServerErrorDetails
> extends ServerError<TDetails, StatusCodes> {
  constructor(
    code: StatusCodes,
    message: string,
    options?: ServerErrorOptions<TDetails>
  ) {
    super(code, message, options);
  }
}

export function parseMessageFromUnknown(x: unknown) {
  if (typeof x === "string") return x;
  if (typeof x === "object" && x !== null && "message" in x)
    return String(x.message);
  return String(x);
}

export function isPrismaClientKnownRequestError(
  error: unknown
): error is PrismaClientKnownRequestError {
  if (error instanceof PrismaClientKnownRequestError) return true;

  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "PrismaClientKnownRequestError"
  )
    return true;

  return false;
}

export function getHttpStatusCodeByPrismaCode(code: string) {
  if (code === "P2025") return StatusCodes.NOT_FOUND;
  return StatusCodes.INTERNAL_SERVER_ERROR;
}

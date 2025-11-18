import type { ServerErrorData, ServerErrorDetails } from "@/types/server-error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { isDriverAdapterError } from "@prisma/driver-adapter-utils";
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

export function isExpectedUniqueConstraintViolation(
  e: any,
  expectedFields: string[]
) {
  if (!(e instanceof PrismaClientKnownRequestError)) return false;

  const { meta } = e;
  if (!meta) return false;
  if (!("driverAdapterError" in meta)) return false;

  const { driverAdapterError } = meta;
  if (!isDriverAdapterError(driverAdapterError)) return false;

  const { cause } = driverAdapterError;
  const { kind, originalCode } = cause;
  if (kind !== "UniqueConstraintViolation") return false;

  // Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (originalCode !== "23505") return false;

  const { constraint } = cause;
  if (!constraint) return false;
  if (!("fields" in constraint)) return false;

  const { fields } = constraint;
  if (expectedFields.length !== fields.length) {
    return false;
  }

  const sortedExpectedFields = expectedFields.toSorted();
  const sortedFields = fields.toSorted();
  for (let i = 0; i < sortedExpectedFields.length; ++i) {
    if (sortedExpectedFields[i] !== sortedFields[i]) {
      return false;
    }
  }

  return true;
}

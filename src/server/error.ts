import * as Base from "@/types/server-error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { StatusCodes } from "http-status-codes";

export type Options<TDetails extends Base.Details = Base.Details> = {
  details?: TDetails;
  errors?: ServerError[];
  cause?: unknown;
};

export class ServerError<
    TDetails extends Base.Details = Base.Details,
    TCode extends number = number
  >
  extends Error
  implements Base.Data
{
  public type: string;
  public details?: TDetails;
  public errors?: ServerError[];

  constructor(
    public code: TCode,
    message: string,
    options?: Options<TDetails>
  ) {
    super(message);
    this.type = this.name;
    if (options?.cause) this.cause = options.cause;
    if (options?.details) this.details = options.details;
    if (options?.errors) this.errors = options.errors;
  }

  toData(): Base.Data {
    const data: Base.Data = {
      code: this.code,
      type: this.type,
      message: this.message,
    };
    if (process.env.NODE_ENV !== "production") {
      if (this.stack) data.stack = this.stack;
      if (this.cause) data.cause = this.cause;
    }
    if (this.details) data.details = this.details;
    if (this.errors) data.errors = this.errors.map((x) => x.toData());
    return data;
  }
}

export class HttpServerError<
  TDetails extends Base.Details = Base.Details
> extends ServerError<TDetails, StatusCodes> {
  constructor(code: StatusCodes, message: string, options?: Options<TDetails>) {
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

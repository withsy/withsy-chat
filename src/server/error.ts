import type { Extra, ServerErrorData } from "@/types/error";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import type { JsonObject } from "type-fest";
import { service } from "./service-registry";

export type ServerErrorOptions<TExtra extends Extra = Extra> = {
  extra?: TExtra;
  errors?: ServerError[];
};

export class ServerError<
    TExtra extends Extra = Extra,
    TCode extends number = number
  >
  extends Error
  implements ServerErrorData
{
  public extra?: TExtra;
  public errors?: ServerError[];

  constructor(
    public code: TCode,
    message: string,
    options?: ServerErrorOptions<TExtra>
  ) {
    super(message);
    this.extra = options?.extra;
    this.errors = options?.errors;
  }

  toData(): ServerErrorData {
    const data: ServerErrorData = {
      code: this.code,
      name: this.name,
      message: this.message,
    };
    if (service.env.nodeEnv === "development")
      if (this.stack) data.stack = this.stack;
    if (this.extra) data.extra = this.extra;
    if (this.errors) data.errors = this.errors.map((x) => x.toData());
    return data;
  }
}

export class HttpServerError<TExtra extends Extra = Extra> extends ServerError<
  TExtra,
  StatusCodes
> {
  constructor(
    code: StatusCodes,
    message: string,
    options?: ServerErrorOptions<TExtra>
  ) {
    super(code, message, options);
    this.name = getReasonPhrase(code);
  }
}

export function parseMessageFromUnknown(x: unknown) {
  if (typeof x === "string") return x;
  if (typeof x === "object" && x !== null && "message" in x)
    return String(x.message);
  return String(x);
}

export class TrpcDataError extends Error {
  constructor(readonly data: JsonObject) {
    super();
  }
}

import type { ApiErrorData, Extra } from "@/types/error";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { envConfig } from "./env-config";

export type ApiErrorOptions<TExtra extends Extra = Extra> = {
  extra?: TExtra;
  errors?: ApiError[];
};

export class ApiError<
    TExtra extends Extra = Extra,
    TCode extends number = number
  >
  extends Error
  implements ApiErrorData
{
  public extra?: TExtra;
  public errors?: ApiError[];

  constructor(
    public code: TCode,
    message: string,
    options?: ApiErrorOptions<TExtra>
  ) {
    super(message);
    this.extra = options?.extra;
    this.errors = options?.errors;
  }

  toData(): ApiErrorData {
    const data: ApiErrorData = {
      code: this.code,
      name: this.name,
      message: this.message,
    };
    if (envConfig.nodeEnv === "development")
      if (this.stack) data.stack = this.stack;
    if (this.extra) data.extra = this.extra;
    if (this.errors) data.errors = this.errors.map((x) => x.toData());
    return data;
  }
}

export class HttpApiError<TExtra extends Extra = Extra> extends ApiError<
  TExtra,
  StatusCodes
> {
  constructor(
    code: StatusCodes,
    message: string,
    options?: ApiErrorOptions<TExtra>
  ) {
    super(code, message, options);
    this.name = getReasonPhrase(code);
  }
}

export class UnauthorizedApiError<
  TExtra extends Extra = Extra
> extends HttpApiError<TExtra> {
  constructor(message: string, options?: ApiErrorOptions<TExtra>) {
    super(StatusCodes.UNAUTHORIZED, message, options);
  }
}

export function parseMessageFromUnknown(x: unknown) {
  if (typeof x === "string") return x;
  if (typeof x === "object" && x !== null && "message" in x)
    return String(x.message);
  return String(x);
}

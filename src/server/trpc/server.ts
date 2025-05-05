import { initTRPC } from "@trpc/server";
import {
  TRPC_ERROR_CODES_BY_KEY,
  type TRPC_ERROR_CODE_KEY,
} from "@trpc/server/unstable-core-do-not-import";
import { StatusCodes } from "http-status-codes";
import { SuperJSON } from "superjson";
import { HttpServerError, ServerError } from "../error";
import type { ServerContext } from "../server-context";

export const t = initTRPC.context<ServerContext>().create({
  transformer: SuperJSON,
  errorFormatter: ({ error, shape }) => {
    const { cause } = error;
    if (cause instanceof HttpServerError) {
      const code_key = getTrpcErrorCodeKeyByStatusCode(cause.code);
      const code = TRPC_ERROR_CODES_BY_KEY[code_key];
      return {
        ...shape,
        data: cause.toData(),
        code,
      };
    }

    if (cause instanceof ServerError) {
      return {
        ...shape,
        data: cause.toData(),
        code: TRPC_ERROR_CODES_BY_KEY.INTERNAL_SERVER_ERROR,
      };
    }

    return shape;
  },
});

export const publicProcedure = t.procedure;

function getTrpcErrorCodeKeyByStatusCode(
  code: StatusCodes
): TRPC_ERROR_CODE_KEY {
  switch (code) {
    case StatusCodes.BAD_REQUEST:
      return "BAD_REQUEST";
    case StatusCodes.INTERNAL_SERVER_ERROR:
      return "INTERNAL_SERVER_ERROR";
    case StatusCodes.NOT_IMPLEMENTED:
      return "NOT_IMPLEMENTED";
    case StatusCodes.BAD_GATEWAY:
      return "BAD_GATEWAY";
    case StatusCodes.SERVICE_UNAVAILABLE:
      return "SERVICE_UNAVAILABLE";
    case StatusCodes.GATEWAY_TIMEOUT:
      return "GATEWAY_TIMEOUT";
    case StatusCodes.UNAUTHORIZED:
      return "UNAUTHORIZED";
    case StatusCodes.FORBIDDEN:
      return "FORBIDDEN";
    case StatusCodes.NOT_FOUND:
      return "NOT_FOUND";
    case StatusCodes.METHOD_NOT_ALLOWED:
      return "METHOD_NOT_SUPPORTED";
    case StatusCodes.REQUEST_TIMEOUT:
      return "TIMEOUT";
    case StatusCodes.CONFLICT:
      return "CONFLICT";
    case StatusCodes.PRECONDITION_FAILED:
      return "PRECONDITION_FAILED";
    case StatusCodes.REQUEST_TOO_LONG:
      return "PAYLOAD_TOO_LARGE";
    case StatusCodes.UNSUPPORTED_MEDIA_TYPE:
      return "UNSUPPORTED_MEDIA_TYPE";
    case StatusCodes.UNPROCESSABLE_ENTITY:
      return "UNPROCESSABLE_CONTENT";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

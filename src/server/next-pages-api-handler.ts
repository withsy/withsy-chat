import type { MaybePromise } from "@/types/common";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  getHttpStatusCodeByPrismaCode,
  HttpServerError,
  isPrismaClientKnownRequestError,
  ServerError,
} from "./error";
import {
  createPublicContext,
  createUserContext,
  type UserContext,
} from "./server-context";

export type Options = {
  ctx: UserContext;
};

export type Handler = {
  get?: (opts: Options) => MaybePromise<void>;
  post?: (opts: Options) => MaybePromise<void>;
};

export function createNextPagesApiHandler(handler: Handler) {
  return async (request: NextApiRequest, response: NextApiResponse) => {
    try {
      const ctx = await createUserContext(
        createPublicContext({ request, response })
      );

      if (request.method === "GET") {
        if (handler.get) {
          return await handler.get({ ctx });
        }
      }

      if (request.method === "POST") {
        if (handler.post) {
          return await handler.post({ ctx });
        }
      }

      throw new HttpServerError(
        StatusCodes.METHOD_NOT_ALLOWED,
        getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED)
      );
    } catch (e) {
      if (e instanceof HttpServerError) {
        return response.status(e.code).json(e.toData());
      }

      if (e instanceof ServerError) {
        return response
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json(e.toData());
      }

      if (isPrismaClientKnownRequestError(e)) {
        const statusCode = getHttpStatusCodeByPrismaCode(e.code);
        return response
          .status(statusCode)
          .json(
            new HttpServerError(
              statusCode,
              getReasonPhrase(statusCode)
            ).toData()
          );
      }

      console.error("Unexpected error occurred. error:", e);
      const internalServerError = new HttpServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        { cause: e }
      );
      return response
        .status(internalServerError.code)
        .json(internalServerError.toData());
    }
  };
}

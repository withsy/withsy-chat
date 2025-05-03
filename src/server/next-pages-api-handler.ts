import type { MaybePromise } from "@/types/common";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { HttpServerError, ServerError } from "./error";
import { createServerContext, type ServerContext } from "./server-context";

export type Options = {
  req: NextApiRequest;
  res: NextApiResponse;
  ctx: ServerContext;
};

export type Handler = {
  get?: (opts: Options) => MaybePromise<void>;
  post?: (opts: Options) => MaybePromise<void>;
};

export async function createNextPagesApiHandler(handler: Handler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const ctx = await createServerContext({ req, res });

      if (req.method === "GET")
        if (handler.get) return await handler.get({ req, res, ctx });

      if (req.method === "POST")
        if (handler.post) return await handler.post({ req, res, ctx });

      throw new HttpServerError(
        StatusCodes.METHOD_NOT_ALLOWED,
        getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED)
      );
    } catch (e) {
      if (e instanceof HttpServerError) {
        return res.status(e.code).json(e.toData());
      }

      if (e instanceof ServerError) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e.toData());
      }

      console.error("Unexpected error occurred. error:", e);
      const internalServerError = new HttpServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        { cause: e }
      );
      return res
        .status(internalServerError.code)
        .json(internalServerError.toData());
    }
  };
}

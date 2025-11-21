import type { MaybePromise } from "@/types/common";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createPublicContext,
  createUserContext,
  type UserContext,
} from "./server-context";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { DataError, getCodeKeyFromPrismaError } from "./error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getStatusCodeFromKey } from "@trpc/server/unstable-core-do-not-import";

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

      throw new TRPCError({ code: "METHOD_NOT_SUPPORTED" });
    } catch (e) {
      if (e instanceof TRPCError) {
        const body: Record<string, unknown> = {
          code: e.code,
          message: e.message,
        };

        if (e.cause instanceof DataError) {
          body["data"] = e.cause.data;
        }

        return response.status(getHTTPStatusCodeFromError(e)).json(body);
      }

      if (e instanceof PrismaClientKnownRequestError) {
        const code = getCodeKeyFromPrismaError(e);
        return response.status(getStatusCodeFromKey(code)).json({
          code,
        });
      }

      console.error("Unexpected error occurred. error:", e);
      return response
        .status(getStatusCodeFromKey("INTERNAL_SERVER_ERROR"))
        .json({
          code: "INTERNAL_SERVER_ERROR",
        });
    }
  };
}

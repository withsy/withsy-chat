import { UserJwt, UserSession } from "@/types/user";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { getAuthOptions } from "./auth";
import { HttpServerError } from "./error";
import { serviceRegistry } from "./service-registry";
import { TRPCError } from "@trpc/server";

export function createPublicContext(input: {
  request: NextApiRequest;
  response: NextApiResponse;
}) {
  const { request, response } = input;
  return { serviceRegistry, request, response };
}

export type PublicContext = ReturnType<typeof createPublicContext>;

export async function createUserContext(ctx: PublicContext) {
  const { request, response } = ctx;

  let userId = "";
  const session = await getServerSession(request, response, getAuthOptions());
  if (session) {
    const userSession = UserSession.parse(session);
    userId = userSession.user.id;
  }

  if (!userId) {
    const token = await getToken({ req: request });
    if (token) {
      const userJwt = UserJwt.parse(token);
      userId = userJwt.sub;
    }
  }

  if (!userId)
    throw new HttpServerError(
      StatusCodes.UNAUTHORIZED,
      getReasonPhrase(StatusCodes.UNAUTHORIZED)
    );

  if (
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "DELETE" ||
    request.method === "PATCH"
  ) {
    const csrfToken = request.headers["x-csrf-token"];
    if (typeof csrfToken !== "string")
      throw new HttpServerError(
        StatusCodes.FORBIDDEN,
        getReasonPhrase(StatusCodes.FORBIDDEN)
      );

    serviceRegistry.nextAuthCsrfService.validateCsrfTokenWithReq({
      csrfToken,
      req: request,
    });
  }

  return {
    ...ctx,
    userId,
  };
}

export type UserContext = Awaited<ReturnType<typeof createUserContext>>;

export async function createApiKeyContext(ctx: PublicContext) {
  const { serviceRegistry, request } = ctx;
  const apiKey = request.headers["x-api-key"];
  if (typeof apiKey !== "string") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid X-Api-Key header.",
    });
  }

  const isValid = await serviceRegistry.apiKeyService.validateToken({
    apiKey,
  });
  if (!isValid) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid API Key." });
  }

  return {
    ...ctx,
  };
}

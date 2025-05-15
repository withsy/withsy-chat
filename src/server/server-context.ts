import type { UserId } from "@/types/id";
import { UserJwt, UserSession } from "@/types/user";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { getAuthOptions } from "./auth";
import { HttpServerError } from "./error";
import { getService, type ServiceRegistry } from "./service-registry";

export type ServerContext = {
  service: ServiceRegistry;
  userId: UserId;
};

export async function createServerContext(input: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<ServerContext> {
  const { req, res } = input;

  let userId = "";
  const session = await getServerSession(req, res, getAuthOptions());
  if (session) {
    const userSession = UserSession.parse(session);
    userId = userSession.user.id;
  }

  if (!userId) {
    const token = await getToken({ req });
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
    req.method === "POST" ||
    req.method === "PUT" ||
    req.method === "DELETE" ||
    req.method === "PATCH"
  ) {
    const csrfToken = req.headers["x-csrf-token"];
    if (typeof csrfToken !== "string")
      throw new HttpServerError(
        StatusCodes.FORBIDDEN,
        getReasonPhrase(StatusCodes.FORBIDDEN)
      );

    getService().nextAuthCsrf.validateCsrfTokenWithReq({ csrfToken, req });
  }

  return { service: getService(), userId };
}

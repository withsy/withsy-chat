import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { User } from "@/types";
import type { UserId } from "@/types/id";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { HttpServerError } from "./error";
import { service, type ServiceRegistry } from "./service-registry";

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
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    const userSession = User.Session.parse(session);
    userId = userSession.user.id;
  }

  if (!userId) {
    const token = await getToken({ req });
    if (token) {
      const userJwt = User.Jwt.parse(token);
      userId = userJwt.sub;
    }
  }

  if (!userId)
    throw new HttpServerError(
      StatusCodes.UNAUTHORIZED,
      getReasonPhrase(StatusCodes.UNAUTHORIZED)
    );

  return { service, userId };
}

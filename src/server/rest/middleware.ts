import { UserSession } from "@/types/user";
import { TRPCError } from "@trpc/server";
import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest } from "next";
import type { Session } from "next-auth";
import type { IncomingMessage } from "node:http";
import { HttpServerError, ServerError } from "../error";
import { createServerContext, type ServerContext } from "../server-context";

declare module "hono" {
  interface ContextVariableMap {
    serverContext: ServerContext;
  }
}

export function setSessionToNextApiRequest(
  req: NextApiRequest,
  session: Session | null
) {
  Reflect.set(req, "session", session);
}

function getSessionFromHonoContext(c: Context) {
  const incoming = Reflect.get(c.env, "incoming") as
    | IncomingMessage
    | undefined;
  if (!incoming)
    throw new HttpServerError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "incoming must exist."
    );

  const session = Reflect.get(incoming, "session") as
    | Session
    | null
    | undefined;
  if (!session)
    throw new HttpServerError(
      StatusCodes.UNAUTHORIZED,
      "Authentication failed."
    );

  return session;
}

export async function parseServerContextMiddleware(c: Context, next: Next) {
  const session = getSessionFromHonoContext(c);
  const userSession = UserSession.parse(session);
  const serverContext = await createServerContext({
    userId: userSession.user.id,
  });
  c.set("serverContext", serverContext);
  await next();
}

export async function handleErrorMiddleware(c: Context, next: Next) {
  const createInternalServerErrorResponse = () =>
    c.json(
      new HttpServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Unexpected error occurred."
      ).toData(),
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  try {
    await next();
  } catch (e) {
    if (e instanceof ServerError) {
      if (e.code === StatusCodes.INTERNAL_SERVER_ERROR) {
        console.error("Unexpected error occurred. error:", e);
        return createInternalServerErrorResponse();
      }

      return c.json(e, e.code);
    } else if (e instanceof TRPCError) {
      console.error("TRPCError needs to be migrated to ServerError. error:", e);
      return createInternalServerErrorResponse();
    }

    console.error("Unexpected error occurred. error:", e);
    return createInternalServerErrorResponse();
  }
}

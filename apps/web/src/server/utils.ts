import { UserData, UserSession } from "@/types/user";
import { subDays } from "date-fns";
import { getServerSession } from "next-auth";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";
import type { IncomingMessage, ServerResponse } from "node:http";
import { getAuthOptions } from "./auth";
import { serverContext } from "./server-context";
import { UserServiceFactory } from "./user/user.service-factory";

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (_e) {
    return false;
  }
}

export function getHardDeleteCutoffDate(now: Date) {
  const cutoffDate = subDays(now, 7);
  return cutoffDate;
}

export async function getUser(input: {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  };
  res: ServerResponse<IncomingMessage>;
}) {
  const { req, res } = input;
  const session = await getServerSession(req, res, getAuthOptions());
  let user: UserData | null = null;
  if (session) {
    const userSession = UserSession.parse(session);
    try {
      user = await new UserServiceFactory(serverContext)
        .create()
        .get(userSession.user.id);
    } catch (_e) {
      // noop
    }
  }

  return user;
}

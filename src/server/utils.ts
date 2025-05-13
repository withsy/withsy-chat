import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { UserData, UserSession } from "@/types/user";
import { subDays } from "date-fns";
import { getServerSession } from "next-auth";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";
import type { IncomingMessage, ServerResponse } from "node:http";
import { service } from "./service-registry";

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

export function getCsrfToken(res: ServerResponse) {
  const csrfToken = res.getHeader("x-csrf-token");
  console.log("@ x-csrf-token", csrfToken);
  if (typeof csrfToken !== "string") return "";
  return csrfToken;
}

export async function getUser(input: {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  };
  res: ServerResponse<IncomingMessage>;
}) {
  const { req, res } = input;
  const session = await getServerSession(req, res, authOptions);
  let user: UserData | null = null;
  if (session) {
    const userSession = UserSession.parse(session);
    try {
      user = await service.user.get(userSession.user.id);
    } catch (_e) {}
  }

  return user;
}

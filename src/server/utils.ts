import { subDays } from "date-fns";
import type { ServerResponse } from "node:http";

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
  if (typeof csrfToken !== "string") return "";
  return csrfToken;
}

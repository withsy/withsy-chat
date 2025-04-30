import { subDays } from "date-fns";

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

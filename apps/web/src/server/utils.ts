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

export function checkTimeZoneUtc() {
  const offset = new Date().getTimezoneOffset();
  if (offset !== 0) {
    throw new Error(`The time zone must be UTC. offset: ${offset}`);
  }
}

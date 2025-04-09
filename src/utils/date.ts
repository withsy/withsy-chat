import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export function formatSmartDate(dateString: string) {
  const date = dayjs(dateString);

  if (date.isToday()) {
    return `Today ${date.format("h:mm A")}`;
  }

  if (date.isYesterday()) {
    return `Yesterday ${date.format("h:mm A")}`;
  }

  return `${date.fromNow()}`;
}

/**
 * "sv-SE" format is "YYYY-MM-DD".
 * The time zone reflects the local system time.
 */
export function toLocaleDateString(date: Date) {
  return date.toLocaleDateString("sv-SE");
}

export function toNewest(lhs: Date, rhs: Date) {
  return rhs.getTime() - lhs.getTime();
}

export function toOldest(lhs: Date, rhs: Date) {
  return -toNewest(lhs, rhs);
}

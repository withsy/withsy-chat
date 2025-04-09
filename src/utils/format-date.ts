import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

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

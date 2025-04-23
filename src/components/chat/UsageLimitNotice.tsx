import React from "react";

type Props = {
  dailyRemaining: number;
  dailyResetAt: Date;
  minuteRemaining: number;
  minuteResetAt: Date;
  themeColor: string;
};

const formatUTC = (date: Date) =>
  date.toISOString().replace("T", " ").replace("Z", " UTC");

const getMinutesLeft = (target: Date) =>
  Math.ceil((target.getTime() - Date.now()) / 60000);

export const UsageLimitNotice: React.FC<Props> = ({
  dailyRemaining,
  dailyResetAt,
  minuteRemaining,
  minuteResetAt,
  themeColor,
}) => {
  if (dailyRemaining === 0) {
    const minutesLeft = getMinutesLeft(dailyResetAt);
    return (
      <span
        className="select-none text-xs text-gray-500"
        style={{ color: `rgb(${themeColor})` }}
      >
        Daily limit reached. Please wait {minutesLeft} minute
        {minutesLeft !== 1 ? "s" : ""} (until {formatUTC(dailyResetAt)}).
      </span>
    );
  }

  if (minuteRemaining === 0) {
    const minutesLeft = getMinutesLeft(minuteResetAt);
    return (
      <span
        className="select-none text-xs text-gray-500"
        style={{ color: `rgb(${themeColor})` }}
      >
        Too many requests. Try again in {minutesLeft} minute
        {minutesLeft !== 1 ? "s" : ""} (until {formatUTC(minuteResetAt)}).
      </span>
    );
  }

  if (dailyRemaining <= 3) {
    return (
      <span
        className="select-none text-xs text-gray-500"
        style={{ color: `rgb(${themeColor})` }}
      >
        Remaining uses today: {dailyRemaining} (Resets at{" "}
        {formatUTC(dailyResetAt)})
      </span>
    );
  }

  return null;
};

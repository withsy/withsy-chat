import React from "react";

type Props = {
  dailyRemaining: number;
  dailyResetAt: Date;
  minuteRemaining: number;
  minuteResetAt: Date;
  themeColor: string;
};

const getMinutesLeft = (target: Date) =>
  Math.ceil((target.getTime() - Date.now()) / 60000);

const buildMessage = (
  type: "daily" | "minute" | "low",
  data: {
    minutesLeft?: number;
    resetAt: Date;
    remaining?: number;
  }
) => {
  switch (type) {
    case "daily":
      return (
        <>
          Daily limit reached. Please wait {data.minutesLeft} minute
          {data.minutesLeft !== 1 ? "s" : ""}
          <span className="hidden sm:inline">
            {" "}
            (until {data.resetAt.toLocaleString()})
          </span>
          .
        </>
      );
    case "minute":
      return (
        <>
          Too many requests. Try again in {data.minutesLeft} minute
          {data.minutesLeft !== 1 ? "s" : ""}
          <span className="hidden sm:inline">
            {" "}
            (until {data.resetAt.toLocaleString()})
          </span>
          .
          {data.minutesLeft && data.minutesLeft <= 1 && (
            <button
              onClick={() => window.location.reload()}
              className="ml-2 inline-block rounded py-0.5 text-xs underline hover:bg-gray-200"
            >
              Refresh
            </button>
          )}
        </>
      );

    case "low":
      return (
        <>
          Remaining uses today: {data.remaining}
          <span className="hidden sm:inline">
            {" "}
            (Resets at {data.resetAt.toLocaleString()})
          </span>
        </>
      );
  }
};

export const UsageLimitNotice: React.FC<Props> = ({
  dailyRemaining,
  dailyResetAt,
  minuteRemaining,
  minuteResetAt,
  themeColor,
}) => {
  let message: React.ReactNode = null;

  if (dailyRemaining === 0) {
    const minutesLeft = getMinutesLeft(dailyResetAt);
    message = buildMessage("daily", { minutesLeft, resetAt: dailyResetAt });
  } else if (minuteRemaining === 0) {
    const minutesLeft = getMinutesLeft(minuteResetAt);
    message = buildMessage("minute", { minutesLeft, resetAt: minuteResetAt });
  } else if (dailyRemaining <= 3) {
    message = buildMessage("low", {
      remaining: dailyRemaining,
      resetAt: dailyResetAt,
    });
  }

  return message ? (
    <span
      className="select-none text-xs text-gray-500"
      style={{ color: `rgb(${themeColor})` }}
    >
      {message}
    </span>
  ) : null;
};

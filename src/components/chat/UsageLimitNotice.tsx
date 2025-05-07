import { useUser } from "@/context/UserContext";
import type { UserUsageLimitData } from "@/types/user-usage-limit";
import React from "react";

type Props = {
  usageLimits: UserUsageLimitData[];
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
          Daily limit reached. Please wait{" "}
          {data.minutesLeft && data.minutesLeft >= 60
            ? `${Math.floor(data.minutesLeft / 60)} hour${
                Math.floor(data.minutesLeft / 60) !== 1 ? "s" : ""
              } ${data.minutesLeft % 60} minute${
                data.minutesLeft % 60 !== 1 ? "s" : ""
              }`
            : `${data.minutesLeft} minute${data.minutesLeft !== 1 ? "s" : ""}`}
          <span className="hidden sm:inline">
            {" "}
            (until {data.resetAt.toLocaleString()})
          </span>
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

export const UsageLimitNotice: React.FC<Props> = ({ usageLimits }) => {
  const { user } = useUser();
  if (!user) return null;

  let message: React.ReactNode = null;
  const messageDaily = usageLimits.find(
    (x) => x.type === "message" && x.period === "daily"
  );
  const messagePerMinute = usageLimits.find(
    (x) => x.type === "message" && x.period === "perMinute"
  );
  if (messageDaily && messageDaily.remainingAmount === 0) {
    const minutesLeft = getMinutesLeft(messageDaily.resetAt);
    message = buildMessage("daily", {
      minutesLeft,
      resetAt: messageDaily.resetAt,
    });
  } else if (messagePerMinute && messagePerMinute.remainingAmount === 0) {
    const minutesLeft = getMinutesLeft(messagePerMinute.resetAt);
    message = buildMessage("minute", {
      minutesLeft,
      resetAt: messagePerMinute.resetAt,
    });
  } else if (messageDaily && messageDaily.remainingAmount <= 3) {
    message = buildMessage("low", {
      remaining: messageDaily.remainingAmount,
      resetAt: messageDaily.resetAt,
    });
  }

  return message ? (
    <span
      className="select-none text-xs text-gray-500"
      style={{
        color: `rgb(${user.preferences.themeColor})`,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      {message}
    </span>
  ) : null;
};

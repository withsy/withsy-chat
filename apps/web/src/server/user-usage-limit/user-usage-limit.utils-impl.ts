import type { UserUsageLimitPeriod } from "@/types/user-usage-limit";
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addYears,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfYear,
} from "date-fns";
import type { Db } from "../db/db";
import { UserUsageLimitService } from "./user-usage-limit.service";

export function createService(context: { db: Db }): UserUsageLimitService {
  const { db } = context;

  return new UserUsageLimitService(db);
}

export function getAnnuallyResetAt(now: Date) {
  return addYears(startOfYear(now), 1);
}

export function getDailyResetAt(now: Date) {
  return addDays(startOfDay(now), 1);
}

export function getMonthlyResetAt(now: Date) {
  return addMonths(startOfMonth(now), 1);
}

export function getPerHourResetAt(now: Date) {
  return addHours(startOfHour(now), 1);
}

export function getPerMinuteResetAt(now: Date) {
  return addMinutes(startOfMinute(now), 1);
}

export function getPerSecondResetAt(now: Date) {
  return addSeconds(startOfSecond(now), 1);
}

export function isExpired(input: { resetAt: Date; now: Date }): boolean {
  const { resetAt, now } = input;

  return resetAt <= now;
}

export function getDataForUpdate(input: {
  allowedAmount: number;
  period: UserUsageLimitPeriod;
  now: Date;
}): { remainingAmount: number; resetAt: Date } {
  const { allowedAmount, period, now } = input;

  const remainingAmount = allowedAmount;
  const resetAt = getResetAtForUpdate({ period, now });

  return {
    remainingAmount,
    resetAt,
  };
}

export function getResetAtForUpdate(input: {
  period: UserUsageLimitPeriod;
  now: Date;
}): Date {
  const { period, now } = input;

  switch (period) {
    case "annually": {
      return getAnnuallyResetAt(now);
    }
    case "monthly": {
      return getMonthlyResetAt(now);
    }
    case "daily": {
      return getDailyResetAt(now);
    }
    case "perHour": {
      return getPerHourResetAt(now);
    }
    case "perMinute": {
      return getPerMinuteResetAt(now);
    }
    case "perSecond": {
      return getPerSecondResetAt(now);
    }
    default: {
      const _: never = period;
      throw new Error(`Unexpected period: ${period}`);
    }
  }
}

import {
  UserUsageLimitPeriod,
  UserUsageLimitType,
  type UserUsageLimitData,
} from "@/types/user-usage-limit";
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
import type { UserUsageLimitModel } from "../generated/prisma/models";
import { UserUsageLimitService } from "./user-usage-limit.service";

export function createService(context: { db: Db }): UserUsageLimitService {
  const { db } = context;

  return new UserUsageLimitService(db);
}

export function createAnnuallyResetAt(now: Date): Date {
  return addYears(startOfYear(now), 1);
}

export function createDailyResetAt(now: Date): Date {
  return addDays(startOfDay(now), 1);
}

export function createMonthlyResetAt(now: Date): Date {
  return addMonths(startOfMonth(now), 1);
}

export function createPerHourResetAt(now: Date): Date {
  return addHours(startOfHour(now), 1);
}

export function createPerMinuteResetAt(now: Date): Date {
  return addMinutes(startOfMinute(now), 1);
}

export function createPerSecondResetAt(now: Date): Date {
  return addSeconds(startOfSecond(now), 1);
}

export function isExpired(input: { resetAt: Date; now: Date }): boolean {
  const { resetAt, now } = input;

  return resetAt <= now;
}

export function createResetAt(input: {
  period: UserUsageLimitPeriod;
  now: Date;
}): Date {
  const { period, now } = input;

  switch (period) {
    case "monthly": {
      return createMonthlyResetAt(now);
    }
    case "daily": {
      return createDailyResetAt(now);
    }
    case "perMinute": {
      return createPerMinuteResetAt(now);
    }
    default: {
      const _: never = period;
      throw new Error(`Unexpected period: ${period}`);
    }
  }
}

export function entityToData(entity: UserUsageLimitModel): UserUsageLimitData {
  const type = UserUsageLimitType.parse(entity.type);
  const period = UserUsageLimitPeriod.parse(entity.period);

  const data: UserUsageLimitData = {
    type,
    period,
    remainingAmount: entity.remainingAmount,
  };

  return data;
}

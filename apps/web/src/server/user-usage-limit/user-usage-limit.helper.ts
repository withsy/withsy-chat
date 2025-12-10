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
import type { UserUsageLimitModel } from "../generated/prisma/models";

export class UserUsageLimitHelper {
  getAnnuallyResetAt(now: Date) {
    return addYears(startOfYear(now), 1);
  }

  getDailyResetAt(now: Date) {
    return addDays(startOfDay(now), 1);
  }

  getMonthlyResetAt(now: Date) {
    return addMonths(startOfMonth(now), 1);
  }

  getPerHourResetAt(now: Date) {
    return addHours(startOfHour(now), 1);
  }

  getPerMinuteResetAt(now: Date) {
    return addMinutes(startOfMinute(now), 1);
  }

  getPerSecondResetAt(now: Date) {
    return addSeconds(startOfSecond(now), 1);
  }

  isExpired(input: { resetAt: Date; now: Date }): boolean {
    const { resetAt, now } = input;

    return resetAt <= now;
  }

  getUpdateData(input: {
    allowedAmount: number;
    period: UserUsageLimitPeriod;
    now: Date;
  }): { remainingAmount: number; resetAt: Date } {
    const { allowedAmount, period, now } = input;

    const remainingAmount = allowedAmount;
    const resetAt = this.getUpdateResetAt({ period, now });
    return {
      remainingAmount,
      resetAt,
    };
  }

  getUpdateResetAt(input: { period: UserUsageLimitPeriod; now: Date }): Date {
    const { period, now } = input;

    switch (period) {
      case "annually": {
        return this.getAnnuallyResetAt(now);
      }
      case "monthly": {
        return this.getMonthlyResetAt(now);
      }
      case "daily": {
        return this.getDailyResetAt(now);
      }
      case "perHour": {
        return this.getPerHourResetAt(now);
      }
      case "perMinute": {
        return this.getPerMinuteResetAt(now);
      }
      case "perSecond": {
        return this.getPerSecondResetAt(now);
      }
      default: {
        const _: never = period;
        throw new Error(`Unexpected period: ${period}`);
      }
    }
  }
}

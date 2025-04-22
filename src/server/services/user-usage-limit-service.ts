import type { UserId } from "@/types/user";
import { UserUsageLimit, UserUsageLimitSelect } from "@/types/user-usage-limit";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserUsageLimitService {
  constructor(private readonly service: ServiceRegistry) {}

  async get(userId: UserId) {
    const res = await this.service.db.userUsageLimit.findFirstOrThrow({
      where: {
        userId,
      },
      select: UserUsageLimitSelect,
    });
    return res;
  }

  static async acquireAndCheck(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const affected = await tx.$executeRaw`
    SELECT id FROM user_usage_limits FOR UPDATE
    WHERE user_id = ${userId} ::uuid
    LIMIT 1;
  `;
    if (affected === 0)
      throw new HttpServerError(StatusCodes.NOT_FOUND, `User not found.`);

    const usageLimit = await tx.userUsageLimit.findFirstOrThrow({
      where: {
        userId,
      },
    });

    const now = new Date();
    resetUsageIfExpired(usageLimit, now);
    await tx.userUsageLimit.update({
      where: {
        id: usageLimit.id,
      },
      data: usageLimit,
    });

    if (usageLimit.dailyUsed >= usageLimit.dailyLimit) {
      throw new HttpServerError(
        StatusCodes.TOO_MANY_REQUESTS,
        "Daily usage limit reached.",
        {
          extra: {
            dailyLimit: usageLimit.dailyLimit,
            dailyUsed: usageLimit.dailyUsed,
            dailyResetAt: usageLimit.dailyResetAt.toISOString(),
          },
        }
      );
    }

    if (usageLimit.minuteUsed >= usageLimit.minuteLimit) {
      throw new HttpServerError(
        StatusCodes.TOO_MANY_REQUESTS,
        "Minute usage limit reached.",
        {
          extra: {
            minuteLimit: usageLimit.minuteLimit,
            minuteUsed: usageLimit.minuteUsed,
            minuteResetAt: usageLimit.minuteResetAt.toISOString(),
          },
        }
      );
    }
  }

  static async acquireAndDeduct(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const affected = await tx.$executeRaw`
      SELECT id FROM user_usage_limits FOR UPDATE
      WHERE user_id = ${userId} ::uuid
      LIMIT 1;
    `;
    if (affected === 0)
      throw new HttpServerError(StatusCodes.NOT_FOUND, `User not found.`);

    const usageLimit = await tx.userUsageLimit.findFirstOrThrow({
      where: {
        userId,
      },
    });

    const now = new Date();
    resetUsageIfExpired(usageLimit, now);

    usageLimit.dailyUsed += 1;
    if (usageLimit.dailyUsed >= usageLimit.dailyLimit) {
      usageLimit.dailyUsed = 0;

      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate() + 1;
      const midnightTomorrow = new Date(year, month, day, 0, 0, 0);
      usageLimit.dailyResetAt = midnightTomorrow;
    }

    usageLimit.minuteUsed += 1;
    if (usageLimit.minuteUsed >= usageLimit.minuteLimit) {
      usageLimit.minuteUsed = 0;

      const oneMinuteLater = new Date(now.getTime() + 60 * 1000);
      usageLimit.minuteResetAt = oneMinuteLater;
    }

    await tx.userUsageLimit.update({
      where: {
        id: usageLimit.id,
      },
      data: usageLimit,
    });
  }

  static async acquireAndCompensate(tx: Tx, input: { userId: UserId }) {
    // TODO
  }
}

function resetUsageIfExpired(usageLimit: UserUsageLimit, now: Date) {
  if (usageLimit.dailyResetAt < now) {
    usageLimit.dailyUsed = 0;

    const tomorrowMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    usageLimit.dailyResetAt = tomorrowMidnight;
  }

  if (usageLimit.minuteResetAt < now) {
    usageLimit.minuteUsed = 0;

    const oneMinuteLater = new Date(now.getTime() + 60 * 1000);
    usageLimit.minuteResetAt = oneMinuteLater;
  }
}

import type { UserId } from "@/types/user";
import {
  rateLimitRpd,
  rateLimitRpm,
  UserUsageLimit,
  UserUsageLimitSelect,
} from "@/types/user-usage-limit";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserUsageLimitService {
  constructor(private readonly service: ServiceRegistry) {}

  async get(userId: UserId) {
    const res = await this.service.db.userUsageLimit.findFirstOrThrow({
      where: { userId },
      select: UserUsageLimitSelect,
    });
    return res;
  }

  static async create(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const now = new Date();
    await tx.userUsageLimit.create({
      data: {
        userId,
        ...UserUsageLimitService.getDailyLimit(now),
        ...UserUsageLimitService.getMinuteLimit(now),
      },
    });
  }

  static async lockAndCheck(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    await UserUsageLimitService.lock(tx, { userId });

    const usageLimit = await tx.userUsageLimit.findFirstOrThrow({
      where: { userId },
    });

    const now = new Date();
    UserUsageLimitService.resetIfExpired(usageLimit, now);
    await tx.userUsageLimit.update({
      where: { id: usageLimit.id },
      data: usageLimit,
    });

    if (usageLimit.dailyRemaining <= 0)
      throw UserUsageLimitService.createDailyLimitError(usageLimit);

    if (usageLimit.minuteRemaining <= 0)
      throw UserUsageLimitService.createMinuteLimitError(usageLimit);
  }

  static async lockAndDecrease(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    await UserUsageLimitService.lock(tx, { userId });

    const usageLimit = await tx.userUsageLimit.findFirstOrThrow({
      where: { userId },
    });

    const now = new Date();
    UserUsageLimitService.resetIfExpired(usageLimit, now);

    if (usageLimit.dailyRemaining < 1)
      throw UserUsageLimitService.createDailyLimitError(usageLimit);

    usageLimit.dailyRemaining -= 1;

    if (usageLimit.minuteRemaining < 1)
      throw UserUsageLimitService.createMinuteLimitError(usageLimit);

    usageLimit.minuteRemaining -= 1;

    await tx.userUsageLimit.update({
      where: { id: usageLimit.id },
      data: usageLimit,
    });
  }

  static async lockAndCompensate(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    await UserUsageLimitService.lock(tx, { userId });

    const usageLimit = await tx.userUsageLimit.findFirstOrThrow({
      where: { userId },
    });

    const now = new Date();
    UserUsageLimitService.resetIfExpired(usageLimit, now);

    usageLimit.dailyRemaining += 1;
    usageLimit.minuteRemaining += 1;

    await tx.userUsageLimit.update({
      where: { id: usageLimit.id },
      data: usageLimit,
    });
  }

  static async lock(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const affected = await tx.$executeRaw`
      SELECT id FROM user_usage_limits
      WHERE user_id = ${userId} ::uuid
      LIMIT 1
      FOR UPDATE;
    `;
    if (affected === 0)
      throw new HttpServerError(StatusCodes.NOT_FOUND, `User not found.`);
  }

  static resetIfExpired(usageLimit: UserUsageLimit, now: Date) {
    if (usageLimit.dailyResetAt < now) {
      usageLimit = {
        ...usageLimit,
        ...UserUsageLimitService.getDailyLimit(now),
      };
    }

    if (usageLimit.minuteResetAt < now) {
      usageLimit = {
        ...usageLimit,
        ...UserUsageLimitService.getMinuteLimit(now),
      };
    }
  }

  static calculateDailyLimit(now: Date) {
    const tomorrowMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    return tomorrowMidnight;
  }

  static calculateMinuteLimit(now: Date) {
    const oneMinuteLater = new Date(now.getTime() + 60 * 1000);
    return oneMinuteLater;
  }

  static getDailyLimit(now: Date) {
    return {
      dailyRemaining: rateLimitRpd,
      dailyResetAt: UserUsageLimitService.calculateDailyLimit(now),
    };
  }

  static getMinuteLimit(now: Date) {
    return {
      minuteRemaining: rateLimitRpm,
      minuteResetAt: UserUsageLimitService.calculateMinuteLimit(now),
    };
  }

  static createDailyLimitError(usageLimit: UserUsageLimit) {
    return new HttpServerError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Daily usage limit reached.",
      {
        extra: {
          type: "daily",
          dailyRemaining: usageLimit.dailyRemaining,
          dailyResetAt: usageLimit.dailyResetAt.toISOString(),
        },
      }
    );
  }

  static createMinuteLimitError(usageLimit: UserUsageLimit) {
    return new HttpServerError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Minute usage limit reached.",
      {
        extra: {
          type: "minute",
          minuteRemaining: usageLimit.minuteRemaining,
          minuteResetAt: usageLimit.minuteResetAt.toISOString(),
        },
      }
    );
  }
}

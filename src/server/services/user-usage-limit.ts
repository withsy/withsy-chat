import type { UserId } from "@/types/user";
import {
  rateLimitRpd,
  rateLimitRpm,
  UserUsageLimit,
  UserUsageLimitSelect,
  type UserUsageLimitErrorInput,
} from "@/types/user-usage-limit";
import { TRPCError } from "@trpc/server";
import { StatusCodes } from "http-status-codes";
import { HttpServerError, TrpcDataError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserUsageLimitService {
  constructor(private readonly service: ServiceRegistry) {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    if (offset !== 0)
      throw new Error(`The server's time zone is not UTC. offset: ${offset}`);
  }

  async get(userId: UserId) {
    const res = await this.service.db.$transaction(async (tx) => {
      const usageLimit = await tx.userUsageLimit.findUniqueOrThrow({
        where: { userId },
        select: { id: true, ...UserUsageLimitSelect },
      });

      const now = new Date();
      UserUsageLimitService.resetIfExpired(usageLimit, now);
      await tx.userUsageLimit.update({
        where: { id: usageLimit.id },
        data: usageLimit,
      });

      return usageLimit;
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

    const usageLimit = await tx.userUsageLimit.findUniqueOrThrow({
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

    const usageLimit = await tx.userUsageLimit.findUniqueOrThrow({
      where: { userId },
    });

    const now = new Date();
    UserUsageLimitService.resetIfExpired(usageLimit, now);

    if (usageLimit.dailyRemaining < 1)
      throw UserUsageLimitService.createDailyLimitError(usageLimit);

    usageLimit.dailyRemaining -= 1;
    if (usageLimit.dailyRemaining === 0)
      usageLimit.dailyResetAt = UserUsageLimitService.calculateDailyLimit(now);

    if (usageLimit.minuteRemaining < 1)
      throw UserUsageLimitService.createMinuteLimitError(usageLimit);

    usageLimit.minuteRemaining -= 1;
    if (usageLimit.minuteRemaining === 0)
      usageLimit.minuteResetAt =
        UserUsageLimitService.calculateMinuteLimit(now);

    await tx.userUsageLimit.update({
      where: { id: usageLimit.id },
      data: usageLimit,
    });
  }

  static async lockAndCompensate(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    await UserUsageLimitService.lock(tx, { userId });

    const usageLimit = await tx.userUsageLimit.findUniqueOrThrow({
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
      const { dailyRemaining, dailyResetAt } =
        UserUsageLimitService.getDailyLimit(now);
      usageLimit.dailyRemaining = dailyRemaining;
      usageLimit.dailyResetAt = dailyResetAt;
    }

    if (usageLimit.minuteResetAt < now) {
      const { minuteRemaining, minuteResetAt } =
        UserUsageLimitService.getMinuteLimit(now);
      usageLimit.minuteRemaining = minuteRemaining;
      usageLimit.minuteResetAt = minuteResetAt;
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
    return new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Daily usage limit reached.",
      cause: new TrpcDataError({
        type: "rate-limit-daily",
        dailyRemaining: usageLimit.dailyRemaining,
        dailyResetAt: usageLimit.dailyResetAt.toISOString(),
      } satisfies UserUsageLimitErrorInput),
    });
  }

  static createMinuteLimitError(usageLimit: UserUsageLimit) {
    return new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Daily usage limit reached.",
      cause: new TrpcDataError({
        type: "rate-limit-minute",
        minuteRemaining: usageLimit.minuteRemaining,
        minuteResetAt: usageLimit.minuteResetAt.toISOString(),
      } satisfies UserUsageLimitErrorInput),
    });
  }
}

import { UserUsageLimit } from "@/types";
import type { UserId } from "@/types/id";
import { TRPCError } from "@trpc/server";
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
import { TrpcDataError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserUsageLimitService {
  constructor(private readonly service: ServiceRegistry) {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    if (offset !== 0)
      throw new Error(`The server's time zone is not UTC. offset: ${offset}`);
  }

  decrypt(entity: UserUsageLimit.Entity): UserUsageLimit.Data {
    const data = {
      type: entity.type,
      period: entity.period,
      remainingAmount: entity.remainingAmount,
      resetAt: entity.resetAt,
    } satisfies UserUsageLimit.Data;
    return data;
  }

  async list(
    userId: UserId,
    input: UserUsageLimit.List
  ): Promise<UserUsageLimit.ListOutput> {
    const { type } = input;
    const entities = await this.service.db.$transaction(async (tx) => {
      const entities = await tx.userUsageLimit.findMany({
        where: { userId, type },
        select: UserUsageLimit.Select,
      });

      const now = new Date();
      for (const entity of entities) {
        if (UserUsageLimitService.resetIfExpired(entity, now))
          await UserUsageLimitService.save(tx, entity);
      }

      return entities;
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  static async create(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const now = new Date();
    await tx.userUsageLimit.createMany({
      data: [
        {
          userId,
          type: "message",
          period: "daily",
          allowedAmount: 30,
          remainingAmount: 30,
          resetAt: UserUsageLimitService.getDailyResetAt(now),
        },
        {
          userId,
          type: "message",
          period: "perMinute",
          allowedAmount: 6,
          remainingAmount: 6,
          resetAt: UserUsageLimitService.getPerMinuteResetAt(now),
        },
        {
          userId,
          type: "aiProfileImage",
          period: "monthly",
          allowedAmount: 10,
          remainingAmount: 10,
          resetAt: UserUsageLimitService.getPerMinuteResetAt(now),
        },
      ],
    });
  }

  static async checkAiProfileImage(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const now = new Date();
    await UserUsageLimitService.check(tx, {
      userId,
      type: "aiProfileImage",
      period: "monthly",
      now,
    });
  }

  static async decreaseAiProfileImage(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const now = new Date();
    await UserUsageLimitService.decrease(tx, {
      userId,
      type: "aiProfileImage",
      period: "monthly",
      now,
    });
  }

  static async compensateAiProfileImage(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const now = new Date();
    await UserUsageLimitService.compensate(tx, {
      userId,
      type: "aiProfileImage",
      period: "monthly",
      now,
    });
  }

  static async checkMessage(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const now = new Date();
    await UserUsageLimitService.check(tx, {
      userId,
      type: "message",
      period: "daily",
      now,
    });
    await UserUsageLimitService.check(tx, {
      userId,
      type: "message",
      period: "perMinute",
      now,
    });
  }

  static async decreaseMessage(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const now = new Date();
    await UserUsageLimitService.decrease(tx, {
      userId,
      type: "message",
      period: "daily",
      now,
    });
    await UserUsageLimitService.decrease(tx, {
      userId,
      type: "message",
      period: "perMinute",
      now,
    });
  }

  static async compensateMessage(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const now = new Date();
    await UserUsageLimitService.compensate(tx, {
      userId,
      type: "message",
      period: "daily",
      now,
    });
    await UserUsageLimitService.compensate(tx, {
      userId,
      type: "message",
      period: "perMinute",
      now,
    });
  }

  static async compensate(
    tx: Tx,
    input: {
      userId: UserId;
      type: UserUsageLimit.Type;
      period: UserUsageLimit.Period;
      now: Date;
    }
  ) {
    const { userId, type, period, now } = input;
    const entity = await UserUsageLimitService.get(tx, {
      userId,
      type,
      period,
    });
    if (UserUsageLimitService.resetIfExpired(entity, now))
      await UserUsageLimitService.save(tx, entity);
    entity.remainingAmount += 1;
    await UserUsageLimitService.save(tx, entity);
  }

  static async decrease(
    tx: Tx,
    input: {
      userId: UserId;
      type: UserUsageLimit.Type;
      period: UserUsageLimit.Period;
      now: Date;
    }
  ) {
    const { userId, type, period, now } = input;
    const entity = await UserUsageLimitService.get(tx, {
      userId,
      type,
      period,
    });
    if (UserUsageLimitService.resetIfExpired(entity, now))
      await UserUsageLimitService.save(tx, entity);
    if (entity.remainingAmount <= 0)
      throw UserUsageLimitService.createError(entity);
    entity.remainingAmount -= 1;
    if (entity.remainingAmount <= 0)
      UserUsageLimitService.updateResetAt(entity, now);
    await UserUsageLimitService.save(tx, entity);
  }

  static async check(
    tx: Tx,
    input: {
      userId: UserId;
      type: UserUsageLimit.Type;
      period: UserUsageLimit.Period;
      now: Date;
    }
  ) {
    const { userId, type, period, now } = input;
    const entity = await UserUsageLimitService.get(tx, {
      userId,
      type,
      period,
    });
    if (UserUsageLimitService.resetIfExpired(entity, now))
      await UserUsageLimitService.save(tx, entity);
    if (entity.remainingAmount <= 0)
      throw UserUsageLimitService.createError(entity);
  }

  static async get(
    tx: Tx,
    input: {
      userId: UserId;
      type: UserUsageLimit.Type;
      period: UserUsageLimit.Period;
    }
  ) {
    const { userId, type, period } = input;
    const entity = await tx.userUsageLimit.findUniqueOrThrow({
      where: {
        userId_type_period: { userId, type, period },
      },
      select: UserUsageLimit.Select,
    });
    return entity;
  }

  static createError(entity: UserUsageLimit.Entity) {
    return new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Usage limit reached.",
      cause: new TrpcDataError({
        type: entity.type,
        period: entity.period,
        remainingAmount: entity.remainingAmount,
        resetAt: entity.resetAt.toISOString(),
      } satisfies UserUsageLimit.ErrorInput),
    });
  }

  static async save(tx: Tx, entity: UserUsageLimit.Entity) {
    await tx.userUsageLimit.update({
      where: { id: entity.id },
      data: entity,
    });
  }

  static resetIfExpired(entity: UserUsageLimit.Entity, now: Date) {
    if (entity.resetAt > now) return false;
    entity.remainingAmount = entity.allowedAmount;
    UserUsageLimitService.updateResetAt(entity, now);
  }

  static updateResetAt(entity: UserUsageLimit.Entity, now: Date) {
    switch (entity.period) {
      case "annually":
        entity.resetAt = UserUsageLimitService.getAnnuallyResetAt(now);
        return true;
      case "monthly":
        entity.resetAt = UserUsageLimitService.getMonthlyResetAt(now);
        return true;
      case "daily":
        entity.resetAt = UserUsageLimitService.getDailyResetAt(now);
        return true;
      case "perHour":
        entity.resetAt = UserUsageLimitService.getPerHourResetAt(now);
        return true;
      case "perMinute":
        entity.resetAt = UserUsageLimitService.getPerMinuteResetAt(now);
        return true;
      case "perSecond":
        entity.resetAt = UserUsageLimitService.getPerSecondResetAt(now);
        return true;
      default:
        const _: never = entity.period;
        throw new Error(`Unexpected period: ${entity.period}`);
    }
  }

  static getAnnuallyResetAt(now: Date) {
    return addYears(startOfYear(now), 1);
  }

  static getDailyResetAt(now: Date) {
    return addDays(startOfDay(now), 1);
  }

  static getMonthlyResetAt(now: Date) {
    return addMonths(startOfMonth(now), 1);
  }

  static getPerHourResetAt(now: Date) {
    return addHours(startOfHour(now), 1);
  }

  static getPerMinuteResetAt(now: Date) {
    return addMinutes(startOfMinute(now), 1);
  }

  static getPerSecondResetAt(now: Date) {
    return addSeconds(startOfSecond(now), 1);
  }
}

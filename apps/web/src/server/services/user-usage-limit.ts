import type { UserId } from "@/types/user";
import {
  UserUsageLimitData,
  UserUsageLimitList,
  UserUsageLimitListOutput,
  UserUsageLimitPeriod,
  UserUsageLimitSelect,
  UserUsageLimitType,
  type UserUsageLimitEntity,
  type UserUsageLimitErrorInput,
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
import { DataError } from "../error";
import type { Db, Tx } from "./db";

export class UserUsageLimitService {
  constructor(private readonly db: Db) {}

  async list(
    userId: UserId,
    input: UserUsageLimitList
  ): Promise<UserUsageLimitListOutput> {
    const { type } = input;
    const entities = await this.db.$transaction(async (tx) => {
      const entities = await tx.userUsageLimit.findMany({
        where: { userId, type },
        select: UserUsageLimitSelect,
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
      type: UserUsageLimitType;
      period: UserUsageLimitPeriod;
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
      type: UserUsageLimitType;
      period: UserUsageLimitPeriod;
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
      type: UserUsageLimitType;
      period: UserUsageLimitPeriod;
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
      type: UserUsageLimitType;
      period: UserUsageLimitPeriod;
    }
  ) {
    const { userId, type, period } = input;
    const entity = await tx.userUsageLimit.findUniqueOrThrow({
      where: {
        userId_type_period: { userId, type, period },
      },
      select: UserUsageLimitSelect,
    });
    return entity;
  }

  static createError(entity: UserUsageLimitEntity) {
    return new DataError({
      type: entity.type,
      period: entity.period,
      remainingAmount: entity.remainingAmount,
      resetAt: entity.resetAt.toISOString(),
    } satisfies UserUsageLimitErrorInput);
  }
}

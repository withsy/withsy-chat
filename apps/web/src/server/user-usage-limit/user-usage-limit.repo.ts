import type { UserId } from "@/types/user";
import type {
  UserUsageLimitId,
  UserUsageLimitPeriod,
  UserUsageLimitType,
} from "@/types/user-usage-limit";
import type { Tx } from "../db/db";
import type { UserUsageLimitModel } from "../generated/prisma/models";
import { UserUsageLimitHelper } from "./user-usage-limit.helper";

export class UserUsageLimitRepo {
  constructor(private readonly tx: Tx) {}

  async create(input: { userId: UserId }): Promise<void> {
    const { userId } = input;

    const now = new Date();
    const userUsageLimitHelper = new UserUsageLimitHelper();
    await this.tx.userUsageLimit.createMany({
      data: [
        {
          userId,
          type: "message",
          period: "daily",
          allowedAmount: 30,
          remainingAmount: 30,
          resetAt: userUsageLimitHelper.getDailyResetAt(now),
        },
        {
          userId,
          type: "message",
          period: "perMinute",
          allowedAmount: 6,
          remainingAmount: 6,
          resetAt: userUsageLimitHelper.getPerMinuteResetAt(now),
        },
        {
          userId,
          type: "aiProfileImage",
          period: "monthly",
          allowedAmount: 10,
          remainingAmount: 10,
          resetAt: userUsageLimitHelper.getPerMinuteResetAt(now),
        },
      ],
    });
  }

  async list(input: {
    userId: UserId;
    type: UserUsageLimitType;
  }): Promise<UserUsageLimitModel[]> {
    const { userId, type } = input;

    return await this.tx.userUsageLimit.findMany({
      where: {
        userId,
        type,
      },
    });
  }

  async update(input: {
    userUsageLimitId: UserUsageLimitId;
    remainingAmount: number;
    resetAt: Date;
  }): Promise<UserUsageLimitModel> {
    const { userUsageLimitId, remainingAmount, resetAt } = input;

    return await this.tx.userUsageLimit.update({
      where: {
        id: userUsageLimitId,
      },
      data: {
        remainingAmount,
        resetAt,
      },
    });
  }

  async check(input: {
    userId: UserId;
    type: UserUsageLimitType;
    period: UserUsageLimitPeriod;
    now: Date;
  }) {}

  async decrease(input: {
    userId: UserId;
    type: UserUsageLimitType;
    period: UserUsageLimitPeriod;
    now: Date;
  }) {
    const { userId, type, period, now } = input;
  }

  async compensate(input: {}) {}
}

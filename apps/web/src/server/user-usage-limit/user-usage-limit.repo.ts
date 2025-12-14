import type { UserId } from "@/types/user";
import {
  UserUsageLimitPeriod,
  UserUsageLimitType,
} from "@/types/user-usage-limit";
import camelcaseKeys from "camelcase-keys";
import type { Tx } from "../db/db";
import type { UserUsageLimitModel } from "../generated/prisma/models";
import { QUOTA_MAP } from "./user-usage-limit.rules";

export class UserUsageLimitRepo {
  constructor(private readonly tx: Tx) {}

  async tryGet(input: {
    userId: UserId;
    type: UserUsageLimitType;
    period: UserUsageLimitPeriod;
  }): Promise<UserUsageLimitModel | null> {
    const { userId, type, period } = input;

    return await this.tx.userUsageLimit.findUnique({
      where: {
        userId_type_period: {
          userId,
          type,
          period,
        },
      },
    });
  }

  async tryConsume(input: {
    userId: UserId;
    type: UserUsageLimitType;
    period: UserUsageLimitPeriod;
    amount: number;
  }): Promise<UserUsageLimitModel | null> {
    const { userId, type, period, amount } = input;

    UserUsageLimitType.parse(type);
    UserUsageLimitPeriod.parse(period);

    const quota = QUOTA_MAP[type][period];
    const createError = () =>
      new Error(
        `Invalid consume data. type: ${type}, period: ${period}, quota: ${quota}, amount: ${amount}.`
      );
    if (!quota || quota <= 0 || amount <= 0) {
      throw createError();
    }

    const remainingAmount = quota - amount;
    if (remainingAmount < 0) {
      throw createError();
    }

    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
INSERT INTO user_usage_limits (
  user_id, type, period, remaining_amount, updated_at
) VALUES (
  ${userId}, ${type}, ${period}, ${remainingAmount}, NOW()
) ON CONFLICT (
  user_id, type, period
) DO UPDATE SET
    remaining_amount = remaining_amount - ${amount},
    updated_at = NOW()
  WHERE
    remaining_amount >= ${amount}
RETURNING *;
`;
    if (rows.length === 0) {
      return null;
    }

    const entity = camelcaseKeys(rows[0]);
    return entity as UserUsageLimitModel;
  }

  async compensate(input: {
    userId: UserId;
    type: UserUsageLimitType;
    period: UserUsageLimitPeriod;
    amount: number;
  }): Promise<UserUsageLimitModel> {
    const { userId, type, period, amount } = input;

    UserUsageLimitType.parse(type);
    UserUsageLimitPeriod.parse(period);

    if (amount <= 0) {
      throw new Error(`Invalid compensate data. amount: ${amount}.`);
    }

    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
UPDATE user_usage_limits SET
  remaining_amount = remaining_amount + ${amount}
WHERE user_id = ${userId}
  AND type = ${type}
  AND period = ${period}
RETURNING *;
`;
    if (rows.length === 0) {
      throw new Error(
        `User usage limit column not found. userId: ${userId}, type: ${type}, period: ${period}.`
      );
    }

    const entity = camelcaseKeys(rows[0]);
    return entity as UserUsageLimitModel;
  }
}

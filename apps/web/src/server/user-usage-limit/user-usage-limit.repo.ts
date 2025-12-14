import type { UserId } from "@/types/user";
import {
  UserUsageLimitPeriod,
  UserUsageLimitType,
  type UserUsageLimitId,
} from "@/types/user-usage-limit";
import camelcaseKeys from "camelcase-keys";
import type { Tx } from "../db/db";
import type { UserUsageLimitModel } from "../generated/prisma/models";

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

  async createOrUpdate(input: {
    userId: UserId;
    type: UserUsageLimitType;
    period: UserUsageLimitPeriod;
    remainingAmount: number;
    resetAt: Date;
  }): Promise<UserUsageLimitModel> {
    const { userId, type, period, remainingAmount, resetAt } = input;

    UserUsageLimitType.parse(type);
    UserUsageLimitPeriod.parse(period);

    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
INSERT INTO user_usage_limits (
  user_id, type, period, remaining_amount, reset_at, updated_at
) VALUES (
  ${userId}, ${type}, ${period}, ${remainingAmount}, ${resetAt}, NOW()
) ON CONFLICT (
  user_id, type, period
) DO UPDATE SET
  remaining_amount = EXCLUDED.remaining_amount,
  reset_at = EXCLUDED.reset_at,
  updated_at = EXCLUDED.updated_at
RETURNING *;
`;

    const entity = camelcaseKeys(rows[0]);
    return entity as UserUsageLimitModel;
  }

  async consume(input: {
    userId: UserId;
    type: UserUsageLimitType;
    period: UserUsageLimitPeriod;
    now: Date;
  }) {}

  async compensate(input: {}) {}
}

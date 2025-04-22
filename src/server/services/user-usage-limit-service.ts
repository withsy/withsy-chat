import type { UserId } from "@/types/user";
import { UserUsageLimitSelect } from "@/types/user-usage-limit";
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

  static async check(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const usageLimit = await tx.userUsageLimit.findFirstOrThrow({
      where: {
        userId,
      },
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

  static async acquireAndUpdate(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const rows = await tx.$queryRaw<unknown[]>`
      SELECT * FROM user_usage_limits FOR UPDATE
      WHERE user_id = ${userId} ::uuid
      LIMIT 1;
    `;
    if (rows.length === 0)
      throw new HttpServerError(StatusCodes.NOT_FOUND, `User not found.`);
  }
}

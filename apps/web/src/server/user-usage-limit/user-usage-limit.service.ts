import type { UserId } from "@/types/user";
import type {
  UserUsageLimitList,
  UserUsageLimitListOutput,
} from "@/types/user-usage-limit";
import type { Db } from "../db/db";
import { UserUsageLimitDecryptor } from "./user-usage-limit.decryptor";
import { UserUsageLimitHelper } from "./user-usage-limit.helper";
import { UserUsageLimitRepo } from "./user-usage-limit.repo";

export class UserUsageLimitService {
  constructor(private readonly db: Db) {}

  async list(
    userId: UserId,
    input: UserUsageLimitList
  ): Promise<UserUsageLimitListOutput> {
    const entities = await this.db.$transaction(async (tx) => {
      const userUsageLimitRepo = new UserUsageLimitRepo(tx);
      const entities = await userUsageLimitRepo.list({
        ...input,
        userId,
      });

      const now = new Date();
      const userUsageLimitHelper = new UserUsageLimitHelper();
      for (let i = 0; i < entities.length; ++i) {
        const { id, resetAt, allowedAmount, period } = entities[i];

        if (userUsageLimitHelper.isExpired({ resetAt, now })) {
          const dataForUpdate = userUsageLimitHelper.getDataForUpdate({
            allowedAmount,
            period,
            now,
          });
          const newEntity = await userUsageLimitRepo.update({
            ...dataForUpdate,
            userUsageLimitId: id,
          });

          entities[i] = newEntity;
        }
      }

      return entities;
    });

    const userUsageLimitDecryptor = new UserUsageLimitDecryptor();
    const datas = entities.map((x) => userUsageLimitDecryptor.decrypt(x));

    return datas;
  }
}

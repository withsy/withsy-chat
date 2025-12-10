import type {
  UserUsageLimitData,
  UserUsageLimitEntity,
} from "@/types/user-usage-limit";

export class UserUsageLimitDecryptor {
  decrypt(entity: UserUsageLimitEntity): UserUsageLimitData {
    const data: UserUsageLimitData = {
      type: entity.type,
      period: entity.period,
      remainingAmount: entity.remainingAmount,
      resetAt: entity.resetAt,
    };
    return data;
  }
}

import type {
  UserUsageLimitPeriod,
  UserUsageLimitType,
} from "@/types/user-usage-limit";

export const USER_USAGE_LIMIT_RULES: Record<
  UserUsageLimitType,
  Partial<Record<UserUsageLimitPeriod, number>>
> = {
  message: {
    daily: 30,
    perMinute: 6,
  },
  aiProfileImage: {
    monthly: 10,
  },
};

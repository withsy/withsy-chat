import type {
  UserUsageLimitPeriod,
  UserUsageLimitType,
} from "@/types/user-usage-limit";

export const QUOTA_MAP: Record<
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

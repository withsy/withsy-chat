import { z } from "zod";
import { DateTimeTz, type zInfer, type zInput } from "./common";

export const UserUsageLimitId = z.number().int();
export type UserUsageLimitId = zInfer<typeof UserUsageLimitId>;

export const UserUsageLimitType = z.enum(["message", "aiProfileImage"]);
export type UserUsageLimitType = zInfer<typeof UserUsageLimitType>;

export const UserUsageLimitPeriod = z.enum(["monthly", "daily", "perMinute"]);
export type UserUsageLimitPeriod = zInfer<typeof UserUsageLimitPeriod>;

export const UserUsageLimitData = z.object({
  get type() {
    return UserUsageLimitType;
  },
  get period() {
    return UserUsageLimitPeriod;
  },
  remainingAmount: z.number().int(),
  get resetAt() {
    return DateTimeTz;
  },
});
export type UserUsageLimitData = zInfer<typeof UserUsageLimitData>;

export const UserUsageLimitError = z.object({
  get type() {
    return UserUsageLimitType;
  },
  get period() {
    return UserUsageLimitPeriod;
  },
  remainingAmount: z.number().int(),
  get resetAt() {
    return DateTimeTz;
  },
});
export type UserUsageLimitError = zInfer<typeof UserUsageLimitError>;
export type UserUsageLimitErrorInput = zInput<typeof UserUsageLimitError>;

export const UserUsageLimitList = z.object({
  get type() {
    return UserUsageLimitType;
  },
});
export type UserUsageLimitList = zInfer<typeof UserUsageLimitList>;

export const UserUsageLimitListOutput = UserUsageLimitData.array();
export type UserUsageLimitListOutput = zInfer<typeof UserUsageLimitListOutput>;

import type { Prisma } from "@/server/generated/prisma/client";
import { z } from "zod";
import { DateTimeTz, type zInfer, type zInput } from "./common";

export const UserUsageLimitSelect = {
  id: true,
  type: true,
  period: true,
  allowedAmount: true,
  remainingAmount: true,
  resetAt: true,
} satisfies Prisma.UserUsageLimitSelect;

export const UserUsageLimitId = z.number().int();
export type UserUsageLimitId = zInfer<typeof UserUsageLimitId>;

export const UserUsageLimitType = z.enum(["message", "aiProfileImage"]);
export type UserUsageLimitType = zInfer<typeof UserUsageLimitType>;

export const UserUsageLimitPeriod = z.enum([
  "annually",
  "monthly",
  "daily",
  "perHour",
  "perMinute",
  "perSecond",
]);
export type UserUsageLimitPeriod = zInfer<typeof UserUsageLimitPeriod>;

export const UserUsageLimitEntity = z.object({
  get id() {
    return UserUsageLimitId;
  },
  get type() {
    return UserUsageLimitType;
  },
  get period() {
    return UserUsageLimitPeriod;
  },
  allowedAmount: z.number().int(),
  remainingAmount: z.number().int(),
  get resetAt() {
    return DateTimeTz;
  },
});

export type UserUsageLimitEntity = zInfer<typeof UserUsageLimitEntity>;

const _checkUserUsageLimit = {} satisfies Omit<
  UserUsageLimitEntity,
  keyof typeof UserUsageLimitSelect
>;

export const UserUsageLimitData = UserUsageLimitEntity.omit({
  id: true,
  allowedAmount: true,
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

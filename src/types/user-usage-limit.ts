import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer, zInput } from "./common";
import { UserUsageLimitId } from "./id";

export const UserUsageLimitSelect = {
  id: true,
  type: true,
  period: true,
  allowedAmount: true,
  remainingAmount: true,
  resetAt: true,
} satisfies Prisma.UserUsageLimitSelect;

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
  id: UserUsageLimitId,
  type: UserUsageLimitType,
  period: UserUsageLimitPeriod,
  allowedAmount: z.number().int(),
  remainingAmount: z.number().int(),
  resetAt: z.date(),
});

export type UserUsageLimitEntity = zInfer<typeof UserUsageLimitEntity>;
const _checkUserUsageLimit = {} satisfies Omit<
  UserUsageLimitEntity,
  keyof typeof UserUsageLimitSelect
>;

export const UserUsageLimitData = UserUsageLimitEntity.omit({
  id: true,
  allowedAmount: true,
}).extend({});
export type UserUsageLimitData = zInfer<typeof UserUsageLimitData>;

export const UserUsageLimitError = z.object({
  type: UserUsageLimitType,
  period: UserUsageLimitPeriod,
  remainingAmount: z.number().int(),
  resetAt: z.string().transform((x) => new Date(x)),
});
export type UserUsageLimitError = zInfer<typeof UserUsageLimitError>;
export type UserUsageLimitErrorInput = zInput<typeof UserUsageLimitError>;

export const UserUsageLimitList = z.object({
  type: UserUsageLimitType,
});
export type UserUsageLimitList = zInfer<typeof UserUsageLimitList>;

export const UserUsageLimitListOutput = z.array(UserUsageLimitData);
export type UserUsageLimitListOutput = zInfer<typeof UserUsageLimitListOutput>;

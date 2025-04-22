import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const UserUsageLimitSelect = {
  dailyLimit: true,
  dailyUsed: true,
  dailyResetAt: true,
  minuteLimit: true,
  minuteUsed: true,
  minuteResetAt: true,
} satisfies Prisma.UserUsageLimitSelect;

export const UserUsageLimitSchema = z.object({
  dailyLimit: z.number().int(),
  dailyUsed: z.number().int(),
  dailyResetAt: z.date(),
  minuteLimit: z.number().int(),
  minuteUsed: z.number().int(),
  minuteResetAt: z.date(),
});
export type UserUsageLimitSchema = zInfer<typeof UserUsageLimitSchema>;
const _ = {} satisfies Omit<
  UserUsageLimitSchema,
  keyof typeof UserUsageLimitSelect
>;

export const UserUsageLimit = UserUsageLimitSchema.extend({});
export type UserUsageLimit = zInfer<typeof UserUsageLimit>;

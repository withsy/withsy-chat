import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const UserUsageLimitSelect = {
  dailyRemaining: true,
  dailyResetAt: true,
  minuteRemaining: true,
  minuteResetAt: true,
} satisfies Prisma.UserUsageLimitSelect;

export const UserUsageLimitSchema = z.object({
  dailyRemaining: z.number().int(),
  dailyResetAt: z.date(),
  minuteRemaining: z.number().int(),
  minuteResetAt: z.date(),
});
export type UserUsageLimitSchema = zInfer<typeof UserUsageLimitSchema>;
const _ = {} satisfies Omit<
  UserUsageLimitSchema,
  keyof typeof UserUsageLimitSelect
>;

export const UserUsageLimit = UserUsageLimitSchema.extend({});
export type UserUsageLimit = zInfer<typeof UserUsageLimit>;

// TODO: Add usage limiting feature per model.
export const rateLimitRpm = 15; // requests per minute
// export const rateLimitRpd = 10; // requests per day
export const rateLimitRpd = 1; // TEST
export const rateLimitTpm = 0; // tokens per minute, NOT used.

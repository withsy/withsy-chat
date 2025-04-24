import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer, zInput } from "./common";

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
export const rateLimitRpd = 30; // requests per day
export const rateLimitTpm = 0; // tokens per minute, NOT used.

export const UserUsageLimitError = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("rate-limit-daily"),
    dailyRemaining: z.number().int(),
    dailyResetAt: z.string().transform((x) => new Date(x)),
  }),
  z.object({
    type: z.literal("rate-limit-minute"),
    minuteRemaining: z.number().int(),
    minuteResetAt: z.string().transform((x) => new Date(x)),
  }),
]);
export type UserUsageLimitError = zInfer<typeof UserUsageLimitError>;
export type UserUsageLimitErrorInput = zInput<typeof UserUsageLimitError>;

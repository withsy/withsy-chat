import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer, zInput } from "./common";

export const Select = {
  type: true,
  period: true,
  allowedAmount: true,
  remainingAmount: true,
  resetAt: true,
} satisfies Prisma.UserUsageLimitSelect;

export const Type = z.enum(["message", "aiProfileImage"]);
export type Type = zInfer<typeof Type>;

export const Period = z.enum(["daily", "minute"]);
export type Period = zInfer<typeof Period>;

export const Entity = z.object({
  type: Type,
  period: Period,
  allowedAmount: z.number().int(),
  remainingAmount: z.number().int(),
  resetAt: z.date(),
});

export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Data = Entity.omit({}).extend({});
export type Data = zInfer<typeof Data>;

// TODO: Add usage limiting feature per model.
export const rateLimitRpm = 6; // requests per minute
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

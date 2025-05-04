import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer, zInput } from "./common";
import { UserUsageLimitId } from "./id";

export const Select = {
  id: true,
  type: true,
  period: true,
  allowedAmount: true,
  remainingAmount: true,
  resetAt: true,
} satisfies Prisma.UserUsageLimitSelect;

export const Type = z.enum(["message", "aiProfileImage"]);
export type Type = zInfer<typeof Type>;

export const Period = z.enum([
  "annually",
  "monthly",
  "daily",
  "perHour",
  "perMinute",
  "perSecond",
]);
export type Period = zInfer<typeof Period>;

export const Entity = z.object({
  id: UserUsageLimitId,
  type: Type,
  period: Period,
  allowedAmount: z.number().int(),
  remainingAmount: z.number().int(),
  resetAt: z.date(),
});

export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Data = Entity.omit({ id: true, allowedAmount: true }).extend({});
export type Data = zInfer<typeof Data>;

export const Error = z.object({
  type: Type,
  period: Period,
  remainingAmount: z.number().int(),
  resetAt: z.string().transform((x) => new Date(x)),
});
export type Error = zInfer<typeof Error>;
export type ErrorInput = zInput<typeof Error>;

export const List = z.object({
  type: Type,
});
export type List = zInfer<typeof List>;

export const ListOutput = z.array(Data);
export type ListOutput = zInfer<typeof ListOutput>;

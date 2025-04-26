import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { type zInfer } from "./common";

export const UserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  language: true,
  timezone: true,
  preferences: true,
} satisfies Prisma.UserSelect;

export const UserId = z.string().uuid();
export type UserId = zInfer<typeof UserId>;

export const UserSchema = z.object({
  id: UserId,
  name: z.string(),
  email: z.string(),
  image: z.string(),
  language: z.string(),
  timezone: z.string(),
  preferences: z.any(),
});
export type UserSchema = zInfer<typeof UserSchema>;
const _ = {} satisfies Omit<UserSchema, keyof typeof UserSelect>;

export const UserPrefs = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("30,30,30"),
  themeOpacity: z.number().default(0),
});
export type UserPrefs = zInfer<typeof UserPrefs>;

export const User = UserSchema.extend({
  preferences: UserPrefs,
});
export type User = zInfer<typeof User>;

export const UserEnsure = z.object({
  language: z.string().optional(),
  timezone: z.string().optional(),
});
export type UserEnsure = zInfer<typeof UserEnsure>;

export const UserUpdatePrefs = UserPrefs.partial();
export type UserUpdatePrefs = zInfer<typeof UserUpdatePrefs>;

export const UserUpdatePrefsOutput = User.pick({
  preferences: true,
});
export type UserUpdatePrefsOutput = zInfer<typeof UserUpdatePrefsOutput>;

export const UserLinkAccountId = z.number().int();
export type UserLinkAccountId = zInfer<typeof UserLinkAccountId>;

export const UserLinkAccount = z.object({
  id: UserLinkAccountId,
  userId: UserId,
  provider: z.string(),
  providerAccountId: z.string(),
  createdAt: z.date(),
});
export type UserLinkAccount = zInfer<typeof UserLinkAccount>;

export const UserJwt = z.object({
  sub: z.string(),
});
export type UserJwt = zInfer<typeof UserJwt>;

export const UserSession = z.object({
  user: z.object({
    name: z.string().nullish(),
    email: z.string().nullish(),
    image: z.string().nullish(),
    id: z.string().min(1),
  }),
  expires: z.string(),
});
export type UserSession = zInfer<typeof UserSession>;

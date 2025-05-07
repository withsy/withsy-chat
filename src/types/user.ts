import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { type zInfer } from "./common";
import { UserId } from "./id";

export const UserSelect = {
  id: true,
  nameEncrypted: true,
  emailEncrypted: true,
  imageUrlEncrypted: true,
  aiLanguage: true,
  timezone: true,
  preferences: true,
} satisfies Prisma.UserSelect;

export const UserEntity = z.object({
  id: UserId,
  nameEncrypted: z.string(),
  emailEncrypted: z.string(),
  imageUrlEncrypted: z.string(),
  aiLanguage: z.string(),
  timezone: z.string(),
  preferences: z.any(),
});
export type UserEntity = zInfer<typeof UserEntity>;
const _checkUser = {} satisfies Omit<UserEntity, keyof typeof UserSelect>;

export const UserPrefs = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("255,187,0"),
  themeOpacity: z.number().default(0.5),
  avatarStyle: z.string().default("thumbs"),
});
export type UserPrefs = zInfer<typeof UserPrefs>;

export const UserData = UserEntity.omit({
  nameEncrypted: true,
  emailEncrypted: true,
  imageUrlEncrypted: true,
  preferences: true,
}).extend({
  name: z.string(),
  email: z.string(),
  imageUrl: z.string(),
  preferences: UserPrefs,
});
export type UserData = zInfer<typeof UserData>;

export const UserEnsure = z.object({
  aiLanguage: z.string().optional(),
  timezone: z.string().optional(),
});
export type UserEnsure = zInfer<typeof UserEnsure>;

export const UserUpdatePrefs = UserPrefs.partial();
export type UserUpdatePrefs = zInfer<typeof UserUpdatePrefs>;

export const UserUpdatePrefsOutput = UserData.pick({
  preferences: true,
});
export type UserUpdatePrefsOutput = zInfer<typeof UserUpdatePrefsOutput>;

export const UserUpdate = UserData.pick({
  aiLanguage: true,
  timezone: true,
}).partial();
export type UserUpdate = zInfer<typeof UserUpdate>;

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

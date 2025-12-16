import { z } from "zod";
import { type zInfer } from "./common";

export const UserPreferences = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("255,187,0"),
  themeOpacity: z.number().default(0.5),
  avatarStyle: z.string().default("thumbs"),
});
export type UserPreferences = zInfer<typeof UserPreferences>;

export const UserData = z.object({
  get id() {
    return UserId;
  },
  aiLanguage: z.string(),
  timezone: z.string(),
  name: z.string(),
  email: z.string(),
  imageUrl: z.string(),
  preferences: z.record(z.string(), z.unknown()),
});
export type UserData = zInfer<typeof UserData>;

export const UserEnsure = z.object({
  aiLanguage: z.string().optional(),
  timezone: z.string().optional(),
});
export type UserEnsure = zInfer<typeof UserEnsure>;

export const UserUpdatePreferences = UserPreferences.partial();
export type UserUpdatePreferences = zInfer<typeof UserUpdatePreferences>;

export const UserUpdatePreferencesOutput = z.record(z.string(), z.unknown());
export type UserUpdatePreferencesOutput = zInfer<
  typeof UserUpdatePreferencesOutput
>;

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

import { z } from "zod";
import type { zInfer } from "./common";

export const UserId = z.string().uuid();
export type UserId = zInfer<typeof UserId>;

export const UserPreferences = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("0,123,255"),
  themeOpacity: z.number().default(0.2),
});
export type UserPreferences = zInfer<typeof UserPreferences>;

export const User = z.object({
  id: UserId,
  preferences: UserPreferences,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = zInfer<typeof User>;

export const UpdateUserPrefs = UserPreferences.partial();
export type UpdateUserPrefs = zInfer<typeof UpdateUserPrefs>;

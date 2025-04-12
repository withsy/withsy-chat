import type { Simplify } from "type-fest";
import { z } from "zod";

export const UserId = z.string().uuid();
export type UserId = Simplify<z.infer<typeof UserId>>;

export const UserPreferences = z.object({
  wideView: z.boolean().nullish(),
  largeText: z.boolean().nullish(),
  enterToSend: z.boolean().nullish(),
  themeColor: z.string().nullish(),
  themeOpacity: z.number().nullish(),
});
export type UserPreferences = Simplify<z.infer<typeof UserPreferences>>;

export const User = z.object({
  id: UserId,
  preferences: UserPreferences,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = Simplify<z.infer<typeof User>>;

export const UpdateUserPrefs = z.object({
  wideView: z.boolean().optional(),
  largeText: z.boolean().optional(),
  enterToSend: z.boolean().optional(),
  themeColor: z.string().nullish(),
  themeOpacity: z.number().nullish(),
});
export type UpdateUserPrefs = Simplify<z.infer<typeof UpdateUserPrefs>>;

import { UserPreferenceValue } from "@repo/common";
import z from "zod";
import { IdempotencyKey } from "../idempotency-key/idempotency-key-schemas";

export const UserId = z.uuid();
export type UserId = z.infer<typeof UserId>;

export const UserLogin = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  refreshToken: z.string().nullish(),
  name: z.string().optional(),
  email: z.string().optional(),
  imageUrl: z.string().optional(),
});
export type UserLogin = z.infer<typeof UserLogin>;

export const UserLoginOutput = z.object({
  get userId() {
    return UserId;
  },
});
export type UserLoginOutput = z.infer<typeof UserLoginOutput>;

export const UserPreferences = z.object({
  wideView: z.boolean(),
  largeText: z.boolean(),
  enterToSend: z.boolean(),
  themeColor: z.string(),
  themeOpacity: z.number(),
  avatarStyle: z.string(),
}) satisfies z.ZodObject<Record<string, z.ZodType<UserPreferenceValue>>>;
export type UserPreferences = z.infer<typeof UserPreferences>;

export const UserGetPreferences = z.object({
  get userId() {
    return UserId;
  },
});
export type UserGetPreferences = z.infer<typeof UserGetPreferences>;

export const UserUpdatePreferences = UserPreferences.partial();
export type UserUpdatePreferences = z.infer<typeof UserUpdatePreferences>;

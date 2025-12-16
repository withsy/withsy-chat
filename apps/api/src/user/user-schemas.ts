import { UserPreferences } from "@repo/common";
import { IdempotencyKey } from "src/idempotency-key/idempotency-key-schemas";
import z from "zod";

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

export const UserPreferencesRaw = z.record(z.string(), z.unknown());
export type UserPreferencesRaw = z.infer<typeof UserPreferencesRaw>;

export const UserUpdatePreferences = UserPreferences.partial();
export type UserUpdatePreferences = z.infer<typeof UserUpdatePreferences>;

import { RawUserPreferences, UserPreferenceValue } from "@repo/common";
import z from "zod";
import { IdempotencyKey } from "../idempotency-key/idempotency-key-schemas.js";

export const UserId = z.uuid();
export type UserId = z.infer<typeof UserId>;

export const UserData = z.object({
  get id() {
    return UserId;
  },
  get preferences() {
    return RawUserPreferences;
  },
});
export type UserData = z.infer<typeof UserData>;

export const UserSignUpIn = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
});
export type UserSignUpIn = z.infer<typeof UserSignUpIn>;

export const UserSignUpInOutput = z.object({
  get userId() {
    return UserId;
  },
});
export type UserSignUpInOutput = z.infer<typeof UserSignUpInOutput>;

export const UserGet = z.object({
  get userId() {
    return UserId;
  },
});
export type UserGet = z.infer<typeof UserGet>;

export const UserUpdate = z.object({
  get preferences() {
    return UserPreferences.partial().optional();
  },
});
export type UserUpdate = z.infer<typeof UserUpdate>;

export const UserPreferences = z.object({
  wideView: z.boolean(),
  largeText: z.boolean(),
  enterToSend: z.boolean(),
  themeColor: z.string(),
  themeOpacity: z.number(),
  avatarStyle: z.string(),
}) satisfies z.ZodObject<Record<string, z.ZodType<UserPreferenceValue>>>;
export type UserPreferences = z.infer<typeof UserPreferences>;

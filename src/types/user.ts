import { z } from "zod";
import { type zInfer, type zInput } from "./common";

export const UserId = z.string().uuid();
export type UserId = zInfer<typeof UserId>;

export const UserPrefs = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("255,87,34"),
  themeOpacity: z.number().default(0.2),
});
export type UserPrefs = zInfer<typeof UserPrefs>;

export const UpdateUserPrefs = UserPrefs.partial();
export type UpdateUserPrefs = zInfer<typeof UpdateUserPrefs>;

export const User = z.object({
  preferences: UserPrefs,
});
export type User = zInfer<typeof User>;

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
export type UserJwtInput = zInput<typeof UserJwt>;

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
export type UserSessionInput = zInput<typeof UserSession>;

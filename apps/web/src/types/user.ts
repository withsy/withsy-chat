import { z } from "zod";
import { type zInfer } from "./common";

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

export const UserUpdate = UserData.pick({
  aiLanguage: true,
  timezone: true,
}).partial();
export type UserUpdate = zInfer<typeof UserUpdate>;

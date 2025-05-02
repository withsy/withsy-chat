import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { type zInfer } from "./common";
import { UserId } from "./id";

export const Select = {
  id: true,
  nameEncrypted: true,
  emailEncrypted: true,
  imageUrlEncrypted: true,
  aiLanguage: true,
  timezone: true,
  preferences: true,
} satisfies Prisma.UserSelect;

export const Entity = z.object({
  id: UserId,
  nameEncrypted: z.string(),
  emailEncrypted: z.string(),
  imageUrlEncrypted: z.string(),
  aiLanguage: z.string(),
  timezone: z.string(),
  preferences: z.any(),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Prefs = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("255,187,0"),
  themeOpacity: z.number().default(0.5),
});
export type Prefs = zInfer<typeof Prefs>;

export const Data = Entity.omit({
  nameEncrypted: true,
  emailEncrypted: true,
  imageUrlEncrypted: true,
  preferences: true,
}).extend({
  name: z.string(),
  email: z.string(),
  imageUrl: z.string(),
  preferences: Prefs,
});
export type Data = zInfer<typeof Data>;

export const Ensure = z.object({
  aiLanguage: z.string().optional(),
  timezone: z.string().optional(),
});
export type Ensure = zInfer<typeof Ensure>;

export const UpdatePrefs = Prefs.partial();
export type UpdatePrefs = zInfer<typeof UpdatePrefs>;

export const UpdatePrefsOutput = Data.pick({
  preferences: true,
});
export type UpdatePrefsOutput = zInfer<typeof UpdatePrefsOutput>;

export const Update = Data.pick({
  aiLanguage: true,
  timezone: true,
}).partial();
export type Update = zInfer<typeof Update>;

export const Jwt = z.object({
  sub: z.string(),
});
export type Jwt = zInfer<typeof Jwt>;

export const Session = z.object({
  user: z.object({
    name: z.string().nullish(),
    email: z.string().nullish(),
    image: z.string().nullish(),
    id: z.string().min(1),
  }),
  expires: z.string(),
});
export type Session = zInfer<typeof Session>;

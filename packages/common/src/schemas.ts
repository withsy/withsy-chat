import { Simplify } from "type-fest";
import z from "zod";

// #region Node.js

export const NodeEnv = z.enum(["production", "development"]);
export type NodeEnv = z.infer<typeof NodeEnv>;

// #endregion Node.js

// #region User

export const PrimitiveValue = z.union([z.number(), z.boolean(), z.string()]);
export type PrimitiveValue = z.infer<typeof PrimitiveValue>;

export const UserPreferences = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("255,187,0"),
  themeOpacity: z.number().default(0.5),
  avatarStyle: z.string().default("thumbs"),
}) satisfies z.ZodObject<Record<string, z.ZodType<PrimitiveValue>>>;
export type UserPreferences = z.infer<typeof UserPreferences>;

export type PartialUserPreferences = Simplify<Partial<UserPreferences>>;

export function filterUserPreferences(
  partial: PartialUserPreferences
): PartialUserPreferences {
  return Object.fromEntries(
    Object.entries(partial).filter(([_, v]) => v != null)
  );
}

// #endregion User

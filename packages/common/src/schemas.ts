import z from "zod";

//#region Node.js

export const NodeEnv = z.enum(["production", "development"]);
export type NodeEnv = z.infer<typeof NodeEnv>;

//#endregion Node.js

//#region User

export const UserPreferenceValue = z.union([
  z.number(),
  z.boolean(),
  z.string(),
]);
export type UserPreferenceValue = z.infer<typeof UserPreferenceValue>;

export const UserPreferences = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("255,187,0"),
  themeOpacity: z.number().default(0.5),
  avatarStyle: z.string().default("thumbs"),
}) satisfies z.ZodObject<Record<string, z.ZodType<UserPreferenceValue>>>;
export type UserPreferences = z.infer<typeof UserPreferences>;

//#endregion User

//#region Model

export const Model = z.enum([
  "gemini-2.5-flash",
  "grok-3",
  "grok-3-mini",
  "grok-3-mini-fast",
]);
export type Model = z.infer<typeof Model>;

//#endregion Model

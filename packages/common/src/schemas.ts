import z from "zod";

// #region Node.js

export const NodeEnv = z.enum(["production", "development"]);
export type NodeEnv = z.infer<typeof NodeEnv>;

// #endregion Node.js

// #region User

export const UserPreferences = z.object({
  wideView: z.boolean().default(false),
  largeText: z.boolean().default(false),
  enterToSend: z.boolean().default(true),
  themeColor: z.string().default("255,187,0"),
  themeOpacity: z.number().default(0.5),
  avatarStyle: z.string().default("thumbs"),
});
export type UserPreferences = z.infer<typeof UserPreferences>;

// #endregion User

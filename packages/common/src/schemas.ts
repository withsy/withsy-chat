import z from "zod";

//#region Node.js

export const NodeEnv = z.enum(["production", "development"]);
export type NodeEnv = z.infer<typeof NodeEnv>;

//#endregion Node.js

//#region Auth

export const AuthToken = z.object({
  userId: z.string(),
});
export type AuthToken = z.infer<typeof AuthToken>;

//#endregion Auth

//#region Model

export const Model = z.enum([
  "gemini-2.5-flash",
  "grok-3",
  "grok-3-mini",
  "grok-3-mini-fast",
]);
export type Model = z.infer<typeof Model>;

//#endregion Model

//#region User

export const UserPreferenceValue = z.union([
  z.number(),
  z.boolean(),
  z.string(),
]);
export type UserPreferenceValue = z.infer<typeof UserPreferenceValue>;

export const RawUserPreferences = z.record(z.string(), UserPreferenceValue);
export type RawUserPreferences = z.infer<typeof RawUserPreferences>;

//#endregion User

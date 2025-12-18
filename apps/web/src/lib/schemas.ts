import z from "zod";

export const Model = z.enum([
  "gemini-2.5-flash",
  "grok-3",
  "grok-3-mini",
  "grok-3-mini-fast",
]);
export type Model = z.infer<typeof Model>;

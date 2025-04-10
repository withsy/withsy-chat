import { z } from "zod";

export const User = z.object({
  preferences: z.object({
    wideView: z.boolean().default(false),
    largeText: z.boolean().default(false),
    enableTabs: z.boolean().default(false),
    showIndex: z.boolean().default(false),
    enterToSend: z.boolean().default(false),
  }),
});
export type User = z.infer<typeof User>;

export const UpdateUserPrefs = z.object({
  wideView: z.boolean().nullish(),
  largeText: z.boolean().nullish(),
  enableTabs: z.boolean().nullish(),
  showIndex: z.boolean().nullish(),
  enterToSend: z.boolean().nullish(),
});
export type UpdateUserPrefs = z.infer<typeof UpdateUserPrefs>;

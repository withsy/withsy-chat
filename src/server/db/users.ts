import { TRPCError } from "@trpc/server";
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
  wideView: z.boolean().optional(),
  largeText: z.boolean().optional(),
  enableTabs: z.boolean().optional(),
  showIndex: z.boolean().optional(),
  enterToSend: z.boolean().optional(),
});
export type UpdateUserPrefs = z.infer<typeof UpdateUserPrefs>;

// TODO: Create "real" DB
export class Users {
  #data = new Map<string, User>();

  constructor() {
    // NOTE: Hardcoded as userId 1 in createContext() /src/server/trpc.ts.
    this.#data.set("1", {
      preferences: {
        wideView: true,
        largeText: true,
        enableTabs: true,
        showIndex: true,
        enterToSend: true,
      },
    });
  }

  me(userId: string): User {
    const user = this.#data.get(userId);
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    return user;
  }

  updatePrefs(userId: string, input: UpdateUserPrefs): User {
    const data = this.#data.get(userId);
    if (!data)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });

    const { wideView, largeText, enableTabs, showIndex, enterToSend } = input;
    if (wideView !== undefined) data.preferences.wideView = wideView;
    if (largeText !== undefined) data.preferences.largeText = largeText;
    if (enableTabs !== undefined) data.preferences.enableTabs = enableTabs;
    if (showIndex !== undefined) data.preferences.showIndex = showIndex;
    if (enterToSend !== undefined) data.preferences.enterToSend = enterToSend;

    return data;
  }
}

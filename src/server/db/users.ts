import type { UpdateUserPrefs, User } from "@/types/user";
import { TRPCError } from "@trpc/server";

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
    if (wideView != null) data.preferences.wideView = wideView;
    if (largeText != null) data.preferences.largeText = largeText;
    if (enableTabs != null) data.preferences.enableTabs = enableTabs;
    if (showIndex != null) data.preferences.showIndex = showIndex;
    if (enterToSend != null) data.preferences.enterToSend = enterToSend;

    return data;
  }
}

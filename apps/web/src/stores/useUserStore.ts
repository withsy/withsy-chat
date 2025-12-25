import type {
  ChatData,
  UserData,
  UserPreferenceKey,
  UserPromptData,
} from "@/common-schemas";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { ChatMessage } from "../../../api/dist/generated/prisma/client";

const STORE_NAME = "user";

interface UserStore {
  clear: () => void;
  user: UserData | null;
  preferenceFetchingKeySet: Set<string>;
  chatMap: Map<string, ChatData>;
  chatMessageMap: Map<string, ChatMessage>;
  userPromptMap: Map<string, UserPromptData>;
}

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set) => ({
      clear: () => {
        set((state) => {
          state.user = null;
          state.preferenceFetchingKeySet.clear();
          state.chatMap.clear();
        });
      },
      user: null,
      preferenceFetchingKeySet: new Set(),
      chatMap: new Map(),
      chatMessageMap: new Map(),
      userPromptMap: new Map(),
    })),
    {
      name: STORE_NAME,
    },
  ),
);

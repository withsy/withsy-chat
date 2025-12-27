import type {
  ChatData,
  ChatId,
  ChatMessageData,
  UserData,
  UserPromptData,
} from "@/common-schemas";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const STORE_NAME = "user";

interface UserStore {
  clear: () => void;
  user: UserData | null;
  preferenceFetchingKeySet: Set<string>;
  chatMap: Map<ChatId, ChatData>;
  chatMessageMap: Map<ChatId, ChatMessageData[]>;
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
          state.userPromptMap.clear();
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

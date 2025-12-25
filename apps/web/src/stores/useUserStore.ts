import type {
  ChatData,
  UserData,
  UserPreferenceKey,
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
  addPreferenceFetchingKeys: (keys: UserPreferenceKey[]) => void;
  deletePreferenceFetchingKeys: (keys: UserPreferenceKey[]) => void;
  chatMap: Map<string, ChatData>;
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
      addPreferenceFetchingKeys: (keys) => {
        set((state) => {
          keys.forEach((key) => state.preferenceFetchingKeySet.add(key));
        });
      },
      deletePreferenceFetchingKeys: (keys) => {
        set((state) => {
          keys.forEach((key) => state.preferenceFetchingKeySet.delete(key));
        });
      },
      chatMap: new Map(),
      userPromptMap: new Map(),
    })),
    {
      name: STORE_NAME,
    },
  ),
);

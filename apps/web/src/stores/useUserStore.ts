import type { ChatData, UserPreferenceKey } from "@/common-schemas";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const STORE_NAME = "user";

interface UserStore {
  clear: () => void;
  id: string;
  setId: (id: string) => void;
  isValid: () => boolean;
  preferenceFetchingKeySet: Set<string>;
  addPreferenceFetchingKeys: (keys: UserPreferenceKey[]) => void;
  deletePreferenceFetchingKeys: (keys: UserPreferenceKey[]) => void;
  chatMap: Map<string, ChatData>;
  currentChatId: string;
}

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set, get) => ({
      clear: () => {
        set((state) => {
          state.id = "";
          state.preferenceFetchingKeySet.clear();
          state.chatMap.clear();
        });
      },
      id: "",
      setId: (id) => {
        set((state) => {
          state.id = id;
        });
      },
      isValid: () => !!get().id,
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
      currentChatId: "",
    })),
    {
      name: STORE_NAME,
    },
  ),
);

import type {
  AuthSession,
  ChatData,
  UserPreferenceKey,
} from "@/common-schemas";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const STORE_NAME = "user";

interface UserStore {
  id: AuthSession["user"]["id"];
  isValid: () => boolean;
  preferenceFetchingKeySet: Set<string>;
  addPreferenceFetchingKeys: (keys: UserPreferenceKey[]) => void;
  deletePreferenceFetchingKeys: (keys: UserPreferenceKey[]) => void;
  chatMap: Map<string, ChatData>;
}

export const useUserStore = create<UserStore>()(
  devtools<UserStore>(
    (set, get) => ({
      id: "",
      isValid: () => !!get().id,
      preferenceFetchingKeySet: new Set(),
      addPreferenceFetchingKeys: (keys) => {
        set((state) => {
          const preferenceFetchingKeySet = new Set(
            state.preferenceFetchingKeySet,
          );
          keys.forEach((key) => preferenceFetchingKeySet.add(key));

          return {
            ...state,
            preferenceFetchingKeySet,
          };
        });
      },
      deletePreferenceFetchingKeys: (keys) => {
        set((state) => {
          const preferenceFetchingKeySet = new Set(
            state.preferenceFetchingKeySet,
          );
          keys.forEach((key) => preferenceFetchingKeySet.delete(key));

          return {
            ...state,
            preferenceFetchingKeySet,
          };
        });
      },
      chatMap: new Map(),
    }),
    {
      name: STORE_NAME,
    },
  ),
);

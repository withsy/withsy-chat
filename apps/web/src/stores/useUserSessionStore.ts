import type {
  PartialUserPreferences,
  UserPreferenceKey,
} from "@/common-schemas";
import type { Model, RawUserPreferences } from "@repo/api-shared";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const STORE_NAME = "user";

interface UserSessionStorageStore {
  clear: () => void;
  preferences: PartialUserPreferences;
  setPreferences: (raw: RawUserPreferences) => void;
  updatePreferences: (partial: PartialUserPreferences) => void;
  selectedModel: Model;
}

export const useUserSessionStore = create<UserSessionStorageStore>()(
  devtools(
    persist(
      immer((set) => ({
        clear: () => {
          set((state) => {
            state.preferences = {};
            state.selectedModel = "gemini-2.5-flash";
          });
          useUserSessionStore.persist.clearStorage();
        },
        preferences: {},
        setPreferences: (raw) => {
          set((state) => {
            const filteredRaw = Object.fromEntries(
              Object.entries(raw).filter(([_, value]) => value !== undefined),
            );

            state.preferences = filteredRaw;
          });
        },
        updatePreferences: (partial) => {
          set((state) => {
            Object.entries(partial).forEach(([key, value]) => {
              if (value === undefined) {
                delete state.preferences[key as UserPreferenceKey];
              } else {
                Reflect.set(state.preferences, key, value);
              }
            });
          });
        },
        selectedModel: "gemini-2.5-flash",
      })),
      {
        name: STORE_NAME,
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
    {
      name: STORE_NAME,
    },
  ),
);

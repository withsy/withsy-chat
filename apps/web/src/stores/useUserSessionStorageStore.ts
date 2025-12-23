import type {
  PartialUserPreferences,
  UserPreferenceKey,
} from "@/common-schemas";
import type { RawUserPreferences } from "@repo/common";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const STORE_NAME = "userSession";

interface UserSessionStorageStore {
  preferences: PartialUserPreferences;
  clear: () => void;
  setPreferences: (raw: RawUserPreferences) => void;
  updatePreferences: (partial: PartialUserPreferences) => void;
}

export const useUserSessionStorageStore = create<UserSessionStorageStore>()(
  devtools(
    persist(
      (set) => ({
        preferences: {},
        clear: () => {
          set({});
          useUserSessionStorageStore.persist.clearStorage();
        },
        setPreferences: (raw) => {
          set((state) => {
            const filteredRaw = Object.fromEntries(
              Object.entries(raw).filter(([_, value]) => value !== undefined),
            );

            return {
              ...state,
              preferences: filteredRaw,
            };
          });
        },
        updatePreferences: (partial) => {
          set((state) => {
            const preferences = {
              ...state.preferences,
            };

            Object.entries(partial).forEach(([key, value]) => {
              if (value === undefined) {
                delete preferences[key as UserPreferenceKey];
              } else {
                Reflect.set(preferences, key, value);
              }
            });

            return {
              ...state,
              preferences,
            };
          });
        },
      }),
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

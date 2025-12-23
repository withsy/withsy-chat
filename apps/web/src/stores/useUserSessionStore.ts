import type {
  PartialUserPreferences,
  UserPreferenceKey,
} from "@/common-schemas";
import type { UserPreferencesRaw } from "@repo/common";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const STORE_NAME = "userSession";

interface UserSessionStore {
  preferences: PartialUserPreferences;
  setPreferences: (raw: UserPreferencesRaw) => void;
  updatePreferences: (partial: PartialUserPreferences) => void;
  clear: () => void;
}

export const useUserSessionStore = create<UserSessionStore>()(
  devtools(
    persist(
      (set, get) => ({
        preferences: {},
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
        clear: () => {
          get().setPreferences({});
          useUserSessionStore.persist.clearStorage();
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

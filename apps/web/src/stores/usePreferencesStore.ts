import { UserPreferences } from "@repo/common";
import type z from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const SetPreferences = UserPreferences.partial();
type SetPreferences = z.infer<typeof SetPreferences>;

interface PreferencesStore {
  preferences: UserPreferences;
  setPreferences: (patch: SetPreferences) => void;
  resetPreferences: () => void;
}

function createDefault() {
  return UserPreferences.parse({});
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      preferences: createDefault(),
      setPreferences: (patch) =>
        set((state) => {
          const preferences = UserPreferences.parse({
            ...state.preferences,
            ...patch,
          });

          return { preferences };
        }),
      resetPreferences: () =>
        set({
          preferences: createDefault(),
        }),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

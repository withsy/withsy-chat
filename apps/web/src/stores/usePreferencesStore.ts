import {
  filterUserPreferences,
  UserPreferences,
  type PartialUserPreferences,
} from "@repo/common";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesStore {
  get: <Key extends keyof UserPreferences>(key: Key) => UserPreferences[Key];
  update: (partial: PartialUserPreferences) => void;
}

const DEFAULT_DATA = UserPreferences.parse({});

export const usePreferencesStore = create<
  PreferencesStore & { data: PartialUserPreferences }
>()(
  persist(
    (set, get) => ({
      data: {},
      get: (key) => {
        const { data } = get();
        return data[key] ?? DEFAULT_DATA[key];
      },
      update: (partial) => {
        set((state) => ({
          data: {
            ...state.data,
            ...filterUserPreferences(partial),
          },
        }));
      },
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

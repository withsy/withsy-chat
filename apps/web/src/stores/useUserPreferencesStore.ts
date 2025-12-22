import type { TrpcOptions } from "@/lib/trpc";
import type { inferInput, inferOutput } from "@trpc/tanstack-react-query";
import type { Simplify } from "type-fest";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "userPreferences";

type UserPreferences = Required<
  inferInput<TrpcOptions["user"]["updatePreferences"]>
>;

type PartialUserPreferences = Simplify<Partial<UserPreferences>>;

type UserPreferenceKey = keyof PartialUserPreferences;

interface UserPreferencesStore {
  data: PartialUserPreferences;
  getByKey: <Key extends UserPreferenceKey>(
    key: Key,
  ) => PartialUserPreferences[Key];
  set: (raw: inferOutput<TrpcOptions["user"]["getPreferences"]>) => void;
  reset: () => void;
  update: (partial: PartialUserPreferences) => void;
}

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (setState, getState) => ({
      data: {},
      getByKey: (key) => getState().data[key],
      set: (raw) => {
        setState((state) => {
          const filtered = Object.fromEntries(
            Object.entries(raw).filter(([_, value]) => value !== undefined),
          );

          return {
            ...state,
            data: filtered,
          };
        });
      },
      reset: () => getState().set({}),
      update: (partial) => {
        setState((state) => {
          const data = {
            ...state.data,
          };

          Object.entries(partial).forEach(([key, value]) => {
            if (value === undefined) {
              delete data[key as UserPreferenceKey];
            } else {
              Reflect.set(data, key, value);
            }
          });

          return {
            ...state,
            data,
          };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

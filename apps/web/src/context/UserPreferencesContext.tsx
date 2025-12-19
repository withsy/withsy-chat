import { useTRPC, type TrpcOptions } from "@/lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferInput, inferOutput } from "@trpc/tanstack-react-query";
import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import type { Simplify } from "type-fest";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

//#region Store

const LOCAL_STORAGE_KEY = "userPreferences";

type UserPreferences = Simplify<
  Required<inferInput<TrpcOptions["user"]["updatePreferences"]>>
>;

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  wideView: false,
  largeText: false,
  enterToSend: true,
  themeColor: "255,187,0",
  themeOpacity: 0.5,
  avatarStyle: "thumbs",
};

type PartialUserPreferences = Simplify<Partial<UserPreferences>>;

type UserPreferenceKey = keyof PartialUserPreferences;

interface UpdateUserPreferences {
  (partial: PartialUserPreferences): void;
}

interface SetUserPreferences {
  (raw: inferOutput<TrpcOptions["user"]["getPreferences"]>): void;
}

interface UserPreferencesStore {
  userPreferences: PartialUserPreferences;
  getUserPreference: <Key extends UserPreferenceKey>(
    key: Key
  ) => PartialUserPreferences[Key];
  setUserPreferences: SetUserPreferences;
  updateUserPreferences: UpdateUserPreferences;
  fetchingKeySet: Set<UserPreferenceKey>;
  hasFetchingKey: <Key extends UserPreferenceKey>(key: Key) => boolean;
  addFetchingKeys: <Key extends UserPreferenceKey>(keys: Key[]) => void;
  deleteFetchingKeys: <Key extends UserPreferenceKey>(keys: Key[]) => void;
}

const USE_STORE = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      userPreferences: {},
      getUserPreference: (key) => get().userPreferences[key],
      setUserPreferences: (raw) => {
        set((state) => {
          const allowedKeys = Object.keys(DEFAULT_USER_PREFERENCES);
          const userPreferences = Object.fromEntries(
            Object.entries(raw)
              .filter(([key, _]) => allowedKeys.includes(key))
              .filter(([_, value]) => value !== undefined)
          );

          return {
            ...state,
            userPreferences,
          };
        });
      },
      updateUserPreferences: (partial) => {
        set((state) => {
          const userPreferences = {
            ...state.userPreferences,
          };

          Object.entries(partial).forEach(([key, value]) => {
            if (value === undefined) {
              delete userPreferences[key as UserPreferenceKey];
            } else {
              Reflect.set(userPreferences, key, value);
            }
          });

          return {
            ...state,
            userPreferences,
          };
        });
      },
      fetchingKeySet: new Set(),
      hasFetchingKey: (key) => get().fetchingKeySet.has(key),
      addFetchingKeys: (keys) => {
        set((state) => {
          const fetchingKeySet = new Set(state.fetchingKeySet);
          keys.forEach((key) => fetchingKeySet.add(key));

          return {
            ...state,
            fetchingKeySet,
          };
        });
      },
      deleteFetchingKeys: (keys) => {
        set((state) => {
          const fetchingKeySet = new Set(state.fetchingKeySet);
          keys.forEach((key) => fetchingKeySet.delete(key));

          return {
            ...state,
            fetchingKeySet,
          };
        });
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ userPreferences }) => ({ userPreferences }),
    }
  )
);

//#endregion Store

//#region Context

interface UserPreferencesContext {
  useUserPreference: <Key extends UserPreferenceKey>(
    key: Key
  ) => UserPreferences[Key];
  updateUserPreferences: (input: PartialUserPreferences) => void;
  useUserPreferenceIsFetching: <Key extends UserPreferenceKey>(
    key: Key
  ) => boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContext | null>(
  null
);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const userPreferences =
        Reflect.get(session.user ?? {}, "preferences") ?? {};
      USE_STORE.getState().setUserPreferences(userPreferences);
    }
  }, [session]);

  const { mutate } = useMutation(
    trpc.user.updatePreferences.mutationOptions({
      onMutate: (vars) => {
        const keys = Object.keys(vars) as UserPreferenceKey[];

        if (keys.some((key) => USE_STORE.getState().hasFetchingKey(key))) {
          throw new Error(
            `Conflict request. fetching keys: ${USE_STORE.getState()
              .fetchingKeySet.keys()
              .toArray()}, input keys: ${keys}.`
          );
        }

        USE_STORE.getState().addFetchingKeys(keys);

        const rollbackMap = new Map<
          string,
          PartialUserPreferences[UserPreferenceKey]
        >();
        keys.forEach((key) => {
          const value = USE_STORE.getState().getUserPreference(key);
          rollbackMap.set(key, value);
        });

        USE_STORE.getState().updateUserPreferences(vars);

        return {
          keys,
          rollbackMap,
        };
      },
      onError: (_, __, res) => {
        if (res) {
          const { rollbackMap } = res;

          USE_STORE.getState().updateUserPreferences(
            Object.fromEntries(rollbackMap)
          );
        }
      },
      onSettled: (_, __, ___, res) => {
        if (res) {
          const { keys } = res;

          USE_STORE.getState().deleteFetchingKeys(keys);
        }
      },
    })
  );

  const useUserPreference = useCallback(
    <Key extends UserPreferenceKey>(key: Key) =>
      USE_STORE((s) => s.getUserPreference(key)) ??
      DEFAULT_USER_PREFERENCES[key],
    []
  );

  const updateUserPreferences = useCallback(
    (input: PartialUserPreferences) => {
      if (session) {
        mutate(input);
      }
    },
    [session, mutate]
  );

  const useUserPreferenceIsFetching = useCallback(
    <Key extends UserPreferenceKey>(key: Key): boolean =>
      USE_STORE((s) => s.hasFetchingKey(key)),
    []
  );

  return (
    <UserPreferencesContext.Provider
      value={{
        useUserPreference,
        updateUserPreferences,
        useUserPreferenceIsFetching,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContext {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error(
      "useUserPreferences must be used within UserPreferencesContext."
    );
  }

  return context;
}

//#endregion Context

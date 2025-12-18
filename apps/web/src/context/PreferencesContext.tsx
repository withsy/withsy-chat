import { useTRPC } from "@/lib/trpc";
import {
  filterUserPreferences,
  UserPreferences,
  type PartialUserPreferences,
} from "@repo/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

//#region Store

const LOCAL_STORAGE_KEY = "preferences";

type PreferenceKey = keyof PartialUserPreferences;

interface UpdatePreferences {
  (partial: PartialUserPreferences): void;
}

interface PreferencesStore {
  preferences: PartialUserPreferences;
  getPreference: <Key extends PreferenceKey>(
    key: Key
  ) => PartialUserPreferences[Key];
  updatePreferences: UpdatePreferences;
  fetchingKeySet: Set<PreferenceKey>;
  hasFetchingKey: <Key extends PreferenceKey>(key: Key) => boolean;
  addFetchingKeys: <Key extends PreferenceKey>(keys: Key[]) => void;
  deleteFetchingKeys: <Key extends PreferenceKey>(keys: Key[]) => void;
}

const USE_STORE = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: {},
      getPreference: (key) => get().preferences[key],
      updatePreferences: (partial) => {
        set((state) => {
          const preferences = {
            ...state.preferences,
          };

          Object.entries(partial).forEach(([key, value]) => {
            if (value === undefined) {
              delete preferences[key as PreferenceKey];
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
      partialize: ({ preferences }) => ({ preferences }),
    }
  )
);

//#endregion Store

//#region Context

const DEFAULT = UserPreferences.parse({});

interface PreferencesContext {
  usePreference: <Key extends PreferenceKey>(key: Key) => UserPreferences[Key];
  updatePreferences: (input: PartialUserPreferences) => void;
  useIsFetching: <Key extends PreferenceKey>(key: Key) => boolean;
}

const PreferencesContext = createContext<PreferencesContext | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const session = useSession();
  const isAuthed = session.status === "authenticated";

  const getQuery = useQuery(
    trpc.user.getPreferences.queryOptions(undefined, {
      enabled: isAuthed,
    })
  );

  useEffect(() => {
    if (getQuery.data) {
      USE_STORE.getState().updatePreferences(getQuery.data);
    }
  }, [getQuery.data]);

  const { mutate } = useMutation(
    trpc.user.updatePreferences.mutationOptions({
      onMutate: (vars) => {
        const filteredVars = filterUserPreferences(vars);
        const keys = Object.keys(filteredVars) as PreferenceKey[];

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
          PartialUserPreferences[PreferenceKey]
        >();
        keys.forEach((key) => {
          const value = USE_STORE.getState().getPreference(key);
          rollbackMap.set(key, value);
        });

        USE_STORE.getState().updatePreferences(filteredVars);

        return {
          keys,
          rollbackMap,
        };
      },
      onError: (_, __, res) => {
        if (res) {
          const { rollbackMap } = res;

          USE_STORE.getState().updatePreferences(
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

  const usePreference = useCallback(
    <Key extends PreferenceKey>(key: Key) =>
      USE_STORE((s) => s.getPreference(key)) ?? DEFAULT[key],
    []
  );

  const updatePreferences = useCallback(
    (input: PartialUserPreferences) => {
      if (isAuthed) {
        mutate(input);
      }
    },
    [isAuthed, mutate]
  );

  const useIsFetching = useCallback(
    <Key extends PreferenceKey>(key: Key): boolean =>
      USE_STORE((s) => s.hasFetchingKey(key)),
    []
  );

  return (
    <PreferencesContext.Provider
      value={{
        usePreference,
        updatePreferences,
        useIsFetching,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContext {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider.");
  }

  return context;
}

//#endregion Context

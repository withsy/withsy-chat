import type {
  PartialUserPreferences,
  UserPreferenceKey,
  UserPreferences,
} from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useUserSessionStorageStore } from "@/stores/useUserSessionStorageStore";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation } from "@tanstack/react-query";

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  wideView: false,
  largeText: false,
  enterToSend: true,
  themeColor: "255,187,0",
  themeOpacity: 0.5,
  avatarStyle: "thumbs",
};

export function useUserPreference<Key extends UserPreferenceKey>(
  key: Key,
): UserPreferences[Key] {
  const value = useUserSessionStorageStore((s) => s.preferences[key]);
  return value ?? DEFAULT_USER_PREFERENCES[key];
}

export function useUserPreferenceIsFetching<Key extends UserPreferenceKey>(
  key: Key,
): boolean {
  return useUserStore((s) => s.preferenceFetchingKeySet.has(key));
}

export function useUserUpdate() {
  const trpc = useTRPC();

  return useMutation(
    trpc.user.update.mutationOptions({
      onMutate: (input) => {
        if (!useUserStore.getState().user) {
          throw new Error("Invalid user state.");
        }

        const filteredInput = Object.fromEntries(
          Object.entries(input).filter(([_, value]) => value !== undefined),
        );
        const keys = Object.keys(filteredInput) as UserPreferenceKey[];

        if (
          keys.some((key) =>
            useUserStore.getState().preferenceFetchingKeySet.has(key),
          )
        ) {
          throw new Error(
            `Conflict request. fetching keys: ${useUserStore
              .getState()
              .preferenceFetchingKeySet.keys()
              .toArray()}, input keys: ${keys}.`,
          );
        }

        const rollbackMap = new Map<
          string,
          PartialUserPreferences[UserPreferenceKey]
        >();
        keys.forEach((key) => {
          const value = Reflect.get(
            useUserSessionStorageStore.getState().preferences,
            key,
          );
          rollbackMap.set(key, value);
        });

        // Optimistic update.
        useUserSessionStorageStore.getState().updatePreferences(filteredInput);

        // Lock keys.
        useUserStore.setState((state) => {
          keys.forEach((key) => state.preferenceFetchingKeySet.add(key));
        });

        return {
          keys,
          rollbackMap,
        };
      },
      onError: (_, __, res) => {
        if (res) {
          const { rollbackMap } = res;

          // Rollback.
          useUserSessionStorageStore
            .getState()
            .updatePreferences(Object.fromEntries(rollbackMap));
        }
      },
      onSuccess: (output) => {
        // Sync with server.
        useUserSessionStorageStore
          .getState()
          .setPreferences(output.preferences);
      },
      onSettled: (_, __, ___, res) => {
        if (res) {
          const { keys } = res;

          // Unlock keys.
          useUserStore.setState((state) => {
            if (res) {
              keys.forEach((key) => state.preferenceFetchingKeySet.delete(key));
            }
          });
        }
      },
    }),
  );
}

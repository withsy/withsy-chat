import type {
  PartialUserPreferences,
  UserPreferenceKey,
  UserPreferences,
} from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useUserSessionStore } from "@/stores/useUserSessionStore";
import { useUserStore } from "@/stores/useUserStore";
import { Model } from "@repo/common";
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
  const value = useUserSessionStore((s) => s.preferences[key]);
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
            useUserSessionStore.getState().preferences,
            key,
          );
          rollbackMap.set(key, value);
        });

        // Optimistic update.
        useUserSessionStore.getState().updatePreferences(filteredInput);

        // Lock keys.
        useUserStore.setState((state) => {
          keys.forEach((key) => state.preferenceFetchingKeySet.add(key));
        });

        return {
          keys,
          rollbackMap,
        };
      },
      onError: (_, __, result) => {
        if (result) {
          const { rollbackMap } = result;

          // Rollback.
          useUserSessionStore
            .getState()
            .updatePreferences(Object.fromEntries(rollbackMap));
        }
      },
      onSuccess: (output) => {
        // Sync with server.
        useUserSessionStore.getState().setPreferences(output.preferences);
      },
      onSettled: (_, __, ___, result) => {
        if (result) {
          const { keys } = result;

          // Unlock keys.
          useUserStore.setState((state) => {
            if (result) {
              keys.forEach((key) => state.preferenceFetchingKeySet.delete(key));
            }
          });
        }
      },
    }),
  );
}

export function useUserSelectedModel(): Model {
  const selectedModel = useUserSessionStore((s) => s.selectedModel);
  const result = Model.safeParse(selectedModel);
  if (!result.success) {
    useUserSessionStore.setState((state) => {
      state.selectedModel = "gemini-2.5-flash";
    });

    return "gemini-2.5-flash";
  }

  return selectedModel;
}

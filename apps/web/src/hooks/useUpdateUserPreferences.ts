import type {
  PartialUserPreferences,
  UserPreferenceKey,
} from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useUserSessionStorageStore } from "@/stores/useUserSessionStorageStore";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation } from "@tanstack/react-query";

interface UpdateUserPreferences {
  (input: PartialUserPreferences): Promise<void>;
}

export function useUpdateUserPreferences(): UpdateUserPreferences {
  const trpc = useTRPC();
  const { mutateAsync } = useMutation(
    trpc.user.updatePreferences.mutationOptions(),
  );

  const updateUserPreferences: UpdateUserPreferences = async (input) => {
    if (!useUserStore.getState().isValid()) {
      throw new Error("User is invalid.");
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
    useUserStore.getState().addPreferenceFetchingKeys(keys);

    try {
      await mutateAsync(filteredInput);
    } catch (_e) {
      // Rollback update.
      useUserSessionStorageStore
        .getState()
        .updatePreferences(Object.fromEntries(rollbackMap));
    } finally {
      // Unlock keys.
      useUserStore.getState().deletePreferenceFetchingKeys(keys);
    }
  };

  return updateUserPreferences;
}

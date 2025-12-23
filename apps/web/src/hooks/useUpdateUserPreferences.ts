import type {
  PartialUserPreferences,
  UserPreferenceKey,
} from "@/common-schemas";
import { useUser } from "@/context/UserContext";
import { useTRPC } from "@/lib/trpc";
import { useUserSessionStore } from "@/stores/useUserSessionStore";
import { useMutation } from "@tanstack/react-query";

interface UpdateUserPreferences {
  (input: PartialUserPreferences): Promise<void>;
}

export function useUpdateUserPreferences(): {
  updateUserPreferences: UpdateUserPreferences;
  isEnabled: boolean;
} {
  const trpc = useTRPC();
  const user = useUser();
  const { mutateAsync } = useMutation(
    trpc.user.updatePreferences.mutationOptions(),
  );
  const { preferences, updatePreferences } = useUserSessionStore();

  const updateUserPreferences: UpdateUserPreferences = async (input) => {
    if (!user) {
      throw new Error("User is not defined.");
    }

    const { preferenceIsFetchingSet } = user;
    const filteredInput = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined),
    );
    const keys = Object.keys(filteredInput);

    if (keys.some((key) => preferenceIsFetchingSet.has(key))) {
      throw new Error(
        `Conflict request. fetching keys: ${preferenceIsFetchingSet
          .keys()
          .toArray()}, input keys: ${keys}.`,
      );
    }

    const rollbackMap = new Map<
      string,
      PartialUserPreferences[UserPreferenceKey]
    >();
    keys.forEach((key) => {
      const value = Reflect.get(preferences, key);
      rollbackMap.set(key, value);
    });

    // Optimistic update.
    updatePreferences(filteredInput);

    // Lock keys.
    keys.forEach((key) => preferenceIsFetchingSet.add(key));
    try {
      await mutateAsync(filteredInput);
    } catch (_e) {
      // Rollback update.
      updatePreferences(Object.fromEntries(rollbackMap));
    } finally {
      // Unlock keys.
      keys.forEach((key) => preferenceIsFetchingSet.delete(key));
    }
  };

  return { updateUserPreferences, isEnabled: !!user };
}

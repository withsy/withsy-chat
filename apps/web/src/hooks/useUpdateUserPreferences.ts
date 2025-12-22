import { useUser } from "@/context/UserContext";
import { useTRPC, type TrpcOptions } from "@/lib/trpc";
import { useUserPreferencesStore } from "@/stores/useUserPreferencesStore";
import { useMutation } from "@tanstack/react-query";
import type { inferInput } from "@trpc/tanstack-react-query";

type UpdateUserPreferencesInput = inferInput<
  TrpcOptions["user"]["updatePreferences"]
>;

export type UserPreferenceKey = keyof UpdateUserPreferencesInput;

interface UpdateUserPreferences {
  (input: UpdateUserPreferencesInput): Promise<void>;
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
  const { getByKey, update } = useUserPreferencesStore();

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
      UpdateUserPreferencesInput[UserPreferenceKey]
    >();
    keys.forEach((key) => {
      const value = getByKey(key as UserPreferenceKey);
      rollbackMap.set(key, value);
    });

    // Optimistic update.
    update(filteredInput);

    // Lock keys.
    keys.forEach((key) => preferenceIsFetchingSet.add(key));
    try {
      await mutateAsync(filteredInput);
    } catch (_e) {
      // Rollback update.
      update(Object.fromEntries(rollbackMap));
    } finally {
      // Unlock keys.
      keys.forEach((key) => preferenceIsFetchingSet.delete(key));
    }
  };

  return { updateUserPreferences, isEnabled: !!user };
}

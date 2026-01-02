import type { UserPreferenceKey, UserPreferences } from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { useUserContext } from "../contexts/UserContext";
import { rawToPartialUserPreferences } from "./_useUserSessionStorage";

export function useUserUpdate() {
  const trpc = useTRPC();
  const userContext = useUserContext();
  const {
    userSessionStorage,
    userPreferencesPending,
    dispatchUserSessionStorage,
    dispatchUserPreferencesPending,
  } = userContext;

  return useMutation(
    trpc.user.update.mutationOptions({
      onMutate: (input) => {
        if (!userContext.userId) {
          throw new Error("Invalid user context.");
        }

        if (input.preferences) {
          input.preferences = rawToPartialUserPreferences(input.preferences);
        }

        const preferenceKeys = Object.keys(
          input.preferences ?? {},
        ) as UserPreferenceKey[];
        if (preferenceKeys.some((key) => userPreferencesPending.has(key))) {
          throw new Error(
            `Conflict request. pending keys: ${userPreferencesPending.keys()}, input keys: ${preferenceKeys}.`,
          );
        }

        const rollbackPreferences = new Map<
          string,
          Partial<UserPreferences>[UserPreferenceKey]
        >();
        preferenceKeys.forEach((key) => {
          const value = userSessionStorage.preferences?.[key];
          rollbackPreferences.set(key, value);
        });

        if (input.preferences) {
          dispatchUserSessionStorage({
            kind: "updatePreferences",
            partial: input.preferences,
          });
        }

        dispatchUserPreferencesPending({
          kind: "add",
          keys: preferenceKeys,
        });

        return {
          preferenceKeys,
          rollbackPreferences,
        };
      },
      onError: (_, __, result) => {
        if (result) {
          const { rollbackPreferences } = result;

          dispatchUserSessionStorage({
            kind: "updatePreferences",
            partial: Object.fromEntries(rollbackPreferences),
          });
        }
      },
      onSuccess: (output) => {
        dispatchUserSessionStorage({
          kind: "setPreferences",
          raw: output.preferences,
        });
      },
      onSettled: (_, __, ___, result) => {
        if (result) {
          const { preferenceKeys } = result;

          dispatchUserPreferencesPending({
            kind: "delete",
            keys: preferenceKeys,
          });
        }
      },
    }),
  );
}

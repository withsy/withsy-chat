import type { UserPreferenceKey, UserPreferences } from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { useUserContext } from "../contexts/UserContext";
import { rawToPartialUserPreferences } from "./_useUserSessionStorage";

export function useUserUpdate() {
  const trpc = useTRPC();
  const userContext = useUserContext();
  const { userSessionStorage, userPreferencesPending } = userContext;

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
        if (
          preferenceKeys.some((key) => userPreferencesPending.data.has(key))
        ) {
          throw new Error(
            `Conflict request. pending keys: ${userPreferencesPending.data.keys()}, input keys: ${preferenceKeys}.`,
          );
        }

        const rollbackPreferences = new Map<
          string,
          Partial<UserPreferences>[UserPreferenceKey]
        >();
        preferenceKeys.forEach((key) => {
          const value = userSessionStorage.data.preferences?.[key];
          rollbackPreferences.set(key, value);
        });

        if (input.preferences) {
          userSessionStorage.dispatch({
            kind: "updatePreferences",
            partial: input.preferences,
          });
        }

        userPreferencesPending.dispatch({
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

          userSessionStorage.dispatch({
            kind: "updatePreferences",
            partial: Object.fromEntries(rollbackPreferences),
          });
        }
      },
      onSuccess: (output) => {
        userSessionStorage.dispatch({
          kind: "setPreferences",
          raw: output.preferences,
        });
      },
      onSettled: (_, __, ___, result) => {
        if (result) {
          const { preferenceKeys } = result;

          userPreferencesPending.dispatch({
            kind: "delete",
            keys: preferenceKeys,
          });
        }
      },
    }),
  );
}

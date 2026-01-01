import type { UserPreferenceKey, UserPreferences } from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { useUserContext } from "../contexts/UserContext";
import { filterRawUserPreferences } from "./useUserSessionStorage";

export function useUserUpdate() {
  const trpc = useTRPC();
  const userContext = useUserContext();
  const { preferencePending, sessionStorage, SetPreferencePending } =
    userContext;

  return useMutation(
    trpc.user.update.mutationOptions({
      onMutate: (input) => {
        if (!userContext.userId) {
          throw new Error("Invalid user context.");
        }

        if (input.preferences) {
          input.preferences = filterRawUserPreferences(input.preferences);
        }

        const preferenceKeys = Object.keys(
          input.preferences ?? {},
        ) as UserPreferenceKey[];
        if (preferenceKeys.some((key) => preferencePending.data.has(key))) {
          throw new Error(
            `Conflict request. pending keys: ${preferencePending.data.keys()}, input keys: ${preferenceKeys}.`,
          );
        }

        const rollbackPreferences = new Map<
          string,
          Partial<UserPreferences>[UserPreferenceKey]
        >();
        preferenceKeys.forEach((key) => {
          const value = sessionStorage.data.preferences?.[key];
          rollbackPreferences.set(key, value);
        });

        if (input.preferences) {
          sessionStorage.updatePreferences(input.preferences);
        }

        SetPreferencePending((state) => {
          preferenceKeys.forEach((key) => {
            state.data.add(key);
          });

          return {
            ...state,
          };
        });

        return {
          preferenceKeys,
          rollbackPreferences,
        };
      },
      onError: (_, __, result) => {
        if (result) {
          const { rollbackPreferences } = result;

          sessionStorage.updatePreferences(
            Object.fromEntries(rollbackPreferences),
          );
        }
      },
      onSuccess: (output) => {
        sessionStorage.setPreferences(output.preferences);
      },
      onSettled: (_, __, ___, result) => {
        if (result) {
          const { preferenceKeys } = result;

          SetPreferencePending((state) => {
            preferenceKeys.forEach((key) => {
              state.data.delete(key);
            });

            return {
              ...state,
            };
          });
        }
      },
    }),
  );
}

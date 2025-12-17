import type { UserPreferences } from "@repo/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useTRPC } from "src/lib/trpc";
import { usePreferencesStore } from "src/stores/usePreferencesStore";

export function usePreference<Key extends keyof UserPreferences>(key: Key) {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const value = usePreferencesStore((s) => s.get(key));
  const update = usePreferencesStore((s) => s.update);
  const trpc = useTRPC();

  const query = useQuery(
    trpc.user.getPreferences.queryOptions(undefined, {
      enabled: isAuthed,
    })
  );

  useEffect(() => {
    if (query.isSuccess) {
      update(query.data);
    }
  }, [query.isSuccess]);

  const mutation = useMutation(trpc.user.updatePreferences.mutationOptions());
}

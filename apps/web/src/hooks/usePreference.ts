import type { UserPreferences } from "@repo/common";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTRPC, useTRPCClient } from "src/lib/trpc";
import { usePreferencesStore } from "src/stores/usePreferencesStore";

export function usePreference<Key extends keyof UserPreferences>(key: Key) {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const value = usePreferencesStore((s) => s.getPreference(key));
  const setPreferences = usePreferencesStore((s) => s.setPreferences);
  const trpc = useTRPC();
  const [isLoading, setIsLoading] = useState(false);

  const query = useQuery(
    trpc.user.getPreferences.queryOptions(undefined, {
      enabled: isAuthed,
    })
  );

  useEffect(() => {
    if (query.isSuccess) {
      setPreferences(query.data);
    }
  }, [query.isSuccess]);
}

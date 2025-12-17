import type { UserPreferences } from "@repo/common";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useTRPC, useTRPCClient } from "src/lib/trpc";
import { usePreferencesStore } from "src/stores/usePreferencesStore";

export function usePreference<K extends keyof UserPreferences>(key: K) {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.userId;

  const value = usePreferencesStore((s) => s.preferences[key]);
  const setPreferences = usePreferencesStore((s) => s.setPreferences);
  const trpc = useTRPC();
  const [isLoading, setIsLoading] = useState(false);

  const a = useQuery(trpc.user.getPreferences.queryOptions());
}

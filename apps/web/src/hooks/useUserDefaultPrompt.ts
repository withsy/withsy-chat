import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useUserDefaultPromptTryGet() {
  const trpc = useTRPC();
  const session = useSession();

  return useQuery(
    trpc.userDefaultPrompt.tryGet.queryOptions(undefined, {
      enabled: session.status === "authenticated",
    }),
  );
}

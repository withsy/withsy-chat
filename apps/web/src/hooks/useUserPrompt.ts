import { useTRPC } from "@/lib/trpc";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useUserPromptList() {
  const trpc = useTRPC();
  const session = useSession();

  return useInfiniteQuery(
    trpc.userPrompt.list.infiniteQueryOptions(
      {},
      {
        enabled: session.status === "authenticated",
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
}

import { useTRPC } from "@/lib/trpc";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useUserPromptList() {
  const trpc = useTRPC();
  const user = useUserStore((s) => s.user);

  return useInfiniteQuery(
    trpc.userPrompt.list.infiniteQueryOptions(
      {},
      {
        enabled: !!user,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
}

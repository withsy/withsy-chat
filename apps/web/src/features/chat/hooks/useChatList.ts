import { useUserContext } from "@/features/user/contexts/UserContext";
import { useTRPC } from "@/lib/trpc";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export function useChatList() {
  const trpc = useTRPC();
  const { userId } = useUserContext();

  return useSuspenseInfiniteQuery(
    trpc.chat.list.infiniteQueryOptions(
      {},
      {
        enabled: !!userId,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
}

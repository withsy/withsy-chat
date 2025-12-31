import type { Order } from "@/common-schemas";
import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";
import { CollapseButton } from "@/components/CollapseButton";
import { PartialEmpty } from "@/components/Empty";
import { PartialError } from "@/components/Error";
import { ChatLayout } from "@/components/layout/ChatLayout";
import { PartialLoading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserPreference } from "@/hooks/useUser";
import { useTRPC } from "@/lib/trpc";
import { useSidebarStore } from "@/stores/useSidebarStore";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");
  const [order, _setOrder] = useState<Order>("desc");

  const setOrder = (value: string) => {
    const isValid = value === "asc" || value === "desc";
    if (!isValid) {
      throw new Error(`Invalid order: ${value}.`);
    }

    _setOrder(value);
  };

  const { collapsed } = useSidebarStore();
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const keyword = searchText.toLowerCase().trim();

  const chatMessageListInput = {
    isBookmarked: true,
    order,
  };

  const chatMessageList = useSuspenseInfiniteQuery(
    trpc.chatMessage.list.infiniteQueryOptions(chatMessageListInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
  );

  // queryClient.cancelQueries(
  //   trpc.chatMessage.list.infiniteQueryFilter(chatMessageListInput),
  // );
  // queryClient.invalidateQueries(
  //   trpc.chatMessage.list.infiniteQueryFilter(chatMessageListInput),
  // );

  // const chatMessageUpdate = useMutation(
  //   trpc.chatMessage.update.mutationOptions(),
  // );

  const handleReset = () => {
    setOrder("desc");
    setSearchText("");
    toast.success("Filters reset");
  };

  const filteredMessages = chatMessageList.data.pages
    .flatMap((x) => x.items)
    .filter((x) => {
      const title = x.chat?.title.toLowerCase() ?? "";
      const text = x.text?.toLowerCase() ?? "";
      return title.includes(keyword) || text.includes(keyword);
    });

  return (
    <ChatLayout>
      <div className="relative flex h-full w-full flex-col p-6">
        <div
          className="absolute top-0 left-0 flex h-[50px] w-full items-center justify-between px-4 select-none"
          style={{
            backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
          }}
        >
          <div>{collapsed && <CollapseButton hoverColor="white" />}</div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-sm hover:bg-white"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Reset Filters</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="flex items-center gap-1 text-sm hover:bg-white"
                >
                  {isFilterOpen ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="mt-[40px]">
          {isFilterOpen && (
            <BookmarkFilters
              order={order}
              setOrder={setOrder}
              searchText={searchText}
              setSearchText={setSearchText}
            />
          )}
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <PartialEmpty message="You haven’t saved any items yet." />
          ) : (
            filteredMessages.map((x) => (
              <BookmarkCard
                key={x.id}
                chatId={x.chatId}
                chatMessageId={x.id}
                title={x.chat?.title}
                text={x.text}
                createdAt={x.createdAt}
              />
            ))
          )}
        </div>
      </div>
    </ChatLayout>
  );
}

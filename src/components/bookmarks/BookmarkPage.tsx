import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { filterMessages } from "@/lib/filter-utils";
import { useTRPC } from "@/lib/trpc";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type * as Message from "@/types/message";
import type * as User from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CollapseButton } from "../CollapseButton";
import { PartialEmpty } from "../Empty";
import { PartialLoading } from "../Loading";
import { Button } from "../ui/button";

export default function BookmarkPage({
  user,
  headerStyle,
}: {
  user: User.Data;
  headerStyle: React.CSSProperties;
}) {
  const trpc = useTRPC();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Message.Data[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const { collapsed } = useSidebarStore();
  const listSaved = useQuery(
    trpc.message.list.queryOptions({
      options: {
        scope: {
          by: "user",
          userId: user.id,
        },
        order: sortOrder,
        include: { chat: true },
      },
      isBookmarked: true,
    })
  );

  useEffect(() => {
    if (!listSaved.data) return;
    setData(listSaved.data);
    setLoading(false);
  }, [listSaved.data]);

  const filteredMessages = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    return filterMessages({
      messages: data,
      sortOrder,
    }).filter((b) => {
      const title = b.chat?.title?.toLowerCase() ?? "";
      const text = b.text?.toLowerCase() ?? "";
      return title.includes(keyword) || text.includes(keyword);
    });
  }, [sortOrder, searchText, data]);

  const reset = () => {
    setSortOrder("desc");
    setSearchText("");
    toast.success("Filters reset");
  };

  if (loading) return <PartialLoading />;

  return (
    <div className="flex flex-col h-full w-full p-6 relative">
      <div
        className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between select-none"
        style={headerStyle}
      >
        <div>{collapsed && <CollapseButton hoverColor="white" />}</div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="flex items-center gap-1 text-sm hover:bg-white"
              >
                <RotateCcw className="w-4 h-4" />
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
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
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
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {filteredMessages.length === 0 ? (
          <PartialEmpty message="You haven’t saved any items yet." />
        ) : (
          filteredMessages.map((message) => (
            <BookmarkCard
              key={message.id}
              chatId={message.chatId}
              messageId={message.id}
              title={message?.chat?.title}
              text={message.text}
              createdAt={message.createdAt}
            />
          ))
        )}
      </div>
    </div>
  );
}

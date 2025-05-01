import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";

import { filterMessages } from "@/lib/filter-utils";
import { trpc } from "@/lib/trpc";
import type { Message } from "@/types/message";
import type { User } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import { PartialEmpty } from "../Empty";
import { PartialLoading } from "../Loading";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { CollapseButton } from "../CollapseButton";

export default function BookmarkPage({
  user,
  headerStyle,
}: {
  user: User;
  headerStyle: React.CSSProperties;
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Message[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { collapsed } = useSidebarStore();
  const listSaved = trpc.message.list.useQuery({
    options: {
      scope: {
        by: "user",
        userId: user.id,
      },
      order: sortOrder,
      include: { chat: true },
    },
    isBookmarked: true,
  });

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
      return b.text?.toLowerCase().includes(keyword) ?? false;
    });
  }, [sortOrder, searchText, data]);

  if (loading) return <PartialLoading />;

  return (
    <div className="flex flex-col h-full w-full p-6 relative">
      <div
        className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between select-none"
        style={headerStyle}
      >
        <div>{collapsed && <CollapseButton />}</div>
      </div>
      <BookmarkFilters
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        searchText={searchText}
        setSearchText={setSearchText}
      />
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

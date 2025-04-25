import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";

import { useUser } from "@/context/UserContext";
import { filterMessages } from "@/lib/filter-utils";
import { trpc } from "@/lib/trpc";
import type { Message } from "@/types/message";
import { useEffect, useMemo, useState } from "react";
import { PartialEmpty } from "../Empty";

export default function BookmarkPage() {
  const { user } = useUser();
  if (!user) throw new Error("User must exist.");

  const { themeColor } = user.preferences;
  const [data, setData] = useState<Message[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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

  return (
    <div className="h-full w-full flex flex-col p-6">
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

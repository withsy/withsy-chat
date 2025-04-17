import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";

import { useUser } from "@/context/UserContext";
import { getFilteredBookmarks } from "@/lib/filter-utils";
import { trpc } from "@/lib/trpc";
import { ChatMessage } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export default function BookmarkPage() {
  const { userPrefs, userSession } = useUser();
  const [data, setData] = useState<ChatMessage[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"chattedAt" | "bookmarkedAt">(
    "bookmarkedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const listSaved = trpc.chatMessage.list.useQuery(
    userSession
      ? {
          options: {
            scope: {
              by: "user",
              userId: userSession.user.id,
            },
            order: sortOrder,
          },
          isBookmarked: true,
        }
      : skipToken
  );

  useEffect(() => {
    if (!listSaved.data) return;
    setData(listSaved.data.map((x) => ChatMessage.parse(x)));
  }, [listSaved.data]);
  console.log(data);

  const filteredMessages = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    return getFilteredBookmarks({
      messages: data,
      sortBy,
      sortOrder,
    }).filter((b) => {
      return b.text.toLowerCase().includes(keyword);
    });
  }, [sortBy, sortOrder, searchText, data]);

  return (
    <div className="h-full w-full flex flex-col p-6">
      <BookmarkFilters
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <div className="mt-4 flex-1 overflow-y-auto space-y-4">
        {filteredMessages.map((message) => (
          <BookmarkCard
            key={message.id}
            themeColor={userPrefs.themeColor}
            {...message}
          />
        ))}
      </div>
    </div>
  );
}

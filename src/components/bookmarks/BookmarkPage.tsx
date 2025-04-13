import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";

import { BookmarkHeader } from "@/components/bookmarks/BookmarkHeader";
import { useSidebar } from "@/context/SidebarContext";
import data from "@/data/bookmarks.json";
import { getFilteredBookmarks } from "@/lib/filter-utils";
import { useMemo, useState } from "react";

export default function BookmarkPage() {
  const { userPrefs } = useSidebar();
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"chattedAt" | "bookmarkedAt">(
    "bookmarkedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "gpt-4",
    "gpt-3.5",
    "claude-3",
  ]);

  const filteredBookmarks = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    return getFilteredBookmarks({
      bookmarks: data,
      selectedModels,
      sortBy,
      sortOrder,
    }).filter((b) => {
      return (
        b.title.toLowerCase().includes(keyword) ||
        b.content.toLowerCase().includes(keyword)
      );
    });
  }, [selectedModels, sortBy, sortOrder, searchText]);

  return (
    <div className="h-full w-full flex flex-col p-6">
      <BookmarkHeader
        count={`${filteredBookmarks.length}/${data.length}`}
        themeColor={userPrefs.themeColor}
      />
      <BookmarkFilters
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        searchText={searchText}
        setSearchText={setSearchText}
        themeColor={userPrefs.themeColor}
      />
      <div className="mt-4 flex-1 overflow-y-auto space-y-4">
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            themeColor={userPrefs.themeColor}
            {...bookmark}
          />
        ))}
      </div>
    </div>
  );
}

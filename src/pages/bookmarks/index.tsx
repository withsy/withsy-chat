import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";

import data from "@/data/bookmarks.json";
import { useMemo, useState } from "react";
import { getFilteredBookmarks } from "@/lib/filter-utils";
import { BookmarkHeader } from "@/components/bookmarks/BookmarkHeader";

export default function BookmarkPage() {
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
    <div>
      <BookmarkHeader count={`${filteredBookmarks.length}/${data.length}`} />
      <BookmarkFilters
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <div className="mt-4 space-y-4">
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark.id} {...bookmark} />
        ))}
      </div>
    </div>
  );
}

import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";

import data from "@/data/bookmarks.json";
import { useMemo, useState } from "react";
import { getFilteredBookmarks } from "@/lib/filter-utils";
import { BookmarkHeader } from "@/components/bookmarks/BookmarkHeader";

export default function BookmarkPage() {
  const [sortBy, setSortBy] = useState<"chattedAt" | "bookmarkedAt">(
    "bookmarkedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "chat",
    "thread",
  ]);
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "gpt-4",
    "gpt-3.5",
  ]);

  const filteredBookmarks = useMemo(() => {
    return getFilteredBookmarks({
      bookmarks: data,
      selectedTypes,
      selectedModels,
      sortBy,
      sortOrder,
    });
  }, [selectedTypes, selectedModels, sortBy, sortOrder]);

  return (
    <div>
      <BookmarkHeader count={data.length} />
      <BookmarkFilters
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
      />
      <div className="mt-4 space-y-4">
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark.id} {...bookmark} />
        ))}
      </div>
    </div>
  );
}

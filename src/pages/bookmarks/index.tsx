import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";
import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import data from "@/data/bookmarks.json";
import { useMemo, useState } from "react";
import { getFilteredBookmarks } from "@/lib/filter-utils";

type Props = {
  count: number;
};

function BookmarkHeader({ count }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Bookmark className="w-6 h-6" fill="currentColor" />
      <h1 className="text-2xl font-bold">Bookmarks</h1>
      <Badge className="text-sm px-2 py-0.5 rounded-full">{count}</Badge>
    </div>
  );
}

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
      <BookmarkHeader count={filteredBookmarks.length} />
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

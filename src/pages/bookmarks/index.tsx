import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";
import { Bookmark } from "lucide-react";
import data from "@/data/bookmarks.json";

function BookmarkHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Bookmark className="w-6 h-6" fill="currentColor" />
      <h1 className="text-2xl font-bold">Bookmarks</h1>
    </div>
  );
}

export default function Page() {
  const bookmarks = data;
  return (
    <div>
      <BookmarkHeader />
      <BookmarkFilters />
      <div className="mt-4 h-[calc(100vh-200px)] overflow-y-auto space-y-4">
        {bookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark.id} {...bookmark} />
        ))}
      </div>
    </div>
  );
}

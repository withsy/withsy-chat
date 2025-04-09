import { BookmarkCard } from "../components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "../components/bookmarks/BookmarkFilters";
import data from "@/data/bookmarks.json";

export default function Page() {
  const bookmarks = data;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bookmarks</h1>
      <BookmarkFilters />
      <div className="mt-4 h-[calc(100vh-200px)] overflow-y-auto space-y-4">
        {bookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark.id} {...bookmark} />
        ))}
      </div>
    </div>
  );
}

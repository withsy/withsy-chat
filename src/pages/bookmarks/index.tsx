import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkFilters } from "@/components/bookmarks/BookmarkFilters";
import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import data from "@/data/bookmarks.json";

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
export default function Page() {
  const bookmarks = data;
  return (
    <div>
      <BookmarkHeader count={bookmarks.length} />
      <BookmarkFilters />
      <div className="mt-4 h-[calc(100vh-200px)] overflow-y-auto space-y-4">
        {bookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark.id} {...bookmark} />
        ))}
      </div>
    </div>
  );
}

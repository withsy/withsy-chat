import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  count: number;
};

export function BookmarkHeader({ count }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Bookmark className="w-6 h-6" fill="currentColor" />
      <h1 className="text-2xl font-bold">Bookmarks</h1>
      <Badge className="text-sm px-2 py-0.5 rounded-full">{count}</Badge>
    </div>
  );
}

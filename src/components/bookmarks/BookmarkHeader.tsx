import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";

type Props = {
  count: string;
  themeColor: string;
};

export function BookmarkHeader({ count, themeColor }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Bookmark
        className="w-6 h-6"
        style={{
          fill: `rgb(${themeColor})`,
          color: `rgb(${themeColor})`,
        }}
      />
      <h1 className="text-2xl font-bold">All Saved</h1>
      <Badge
        className="px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: `rgb(${themeColor})`,
        }}
      >
        {count}
      </Badge>
    </div>
  );
}

import { Copy, Bookmark as BookmarkIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MarkdownBox } from "@/components/MarkdownBox";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";

interface BookmarkCardProps {
  type: string;
  model: string;
  title: string;
  chattedAt: string;
  bookmarkedAt: string;
  content: string;
}

export function BookmarkCard({
  type,
  model,
  title,
  chattedAt,
  bookmarkedAt,
  content,
}: BookmarkCardProps) {
  const chatId = chattedAt;
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(true); // ✅ 기본 북마크 상태

  const shouldCollapse = content.length > 300;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  const handleToggleBookmark = () => {
    setBookmarked(false);
  };

  if (!bookmarked) return null;

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white rounded-md p-1 border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="bg-white hover:bg-gray-100"
        >
          <Copy className="w-4 h-4 text-black" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleBookmark}
          className="bg-white hover:bg-gray-100"
        >
          <BookmarkIcon className="w-4 h-4" fill="black" stroke="white" />
        </Button>
      </div>

      <Card>
        <BookmarkCardHeader
          type={type}
          model={model}
          title={title}
          bookmarkedAt={bookmarkedAt}
          chattedAt={chattedAt}
          link={`/chat/${chatId}`}
        />
        <Separator />
        <CardContent className="mt-2 space-y-3">
          <div
            className={`transition-all overflow-hidden relative ${
              expanded
                ? "max-h-full"
                : shouldCollapse
                ? "max-h-[160px]"
                : "max-h-full"
            }`}
          >
            <MarkdownBox content={content} />
            {!expanded && shouldCollapse && (
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}
          </div>
          {shouldCollapse && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

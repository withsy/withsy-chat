import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";
import { MarkdownBox } from "@/components/MarkdownBox";
import { Button } from "@/components/ui/button";

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

  const shouldCollapse = content.length > 300;

  return (
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
      <CardContent className="mt-2 space-y-3 relative">
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
            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent pointer-events-none" />
          )}
        </div>

        {shouldCollapse && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="font-bold"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Show less" : "Show more"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

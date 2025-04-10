import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MarkdownBox } from "@/components/MarkdownBox";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";
import { toast } from "sonner";
import { BookmarkCardActions } from "./BookmarkCardActions";

interface BookmarkCardProps {
  type: string;
  model: string;
  title: string;
  chattedAt: string;
  bookmarkedAt: string;
  content: string;
}

export function BookmarkCard({
  model,
  title,
  chattedAt,
  bookmarkedAt,
  content,
}: BookmarkCardProps) {
  const chatId = chattedAt;
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(true);
  const [titleState, setTitleState] = useState(title);

  const shouldCollapse = content.length > 300;

  const handleToggleBookmark = () => {
    setBookmarked(false);
    toast.info("Bookmark removed", {
      description: "This chat has been removed from bookmarks.",
    });
  };

  if (!bookmarked) return null;

  return (
    <div className="relative group">
      <BookmarkCardActions
        title={titleState}
        content={content}
        onUnbookmark={handleToggleBookmark}
        onTitleChange={setTitleState}
      />

      <Card>
        <BookmarkCardHeader
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

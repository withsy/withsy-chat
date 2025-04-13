import { useState } from "react";

import { MarkdownBox } from "@/components/MarkdownBox";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CollapseToggle } from "../CollapseToggle";
import { BookmarkCardActions } from "./BookmarkCardActions";

interface BookmarkCardProps {
  type: string;
  title: string;
  chattedAt: string;
  content: string;
  themeColor: string;
}

export function BookmarkCard({
  title,
  chattedAt,
  content,
  themeColor,
}: BookmarkCardProps) {
  const chatId = chattedAt;
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(true);
  const [titleState, _setTitleState] = useState(title);

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
      <Card>
        <BookmarkCardHeader
          title={titleState}
          chattedAt={chattedAt}
          link={`/chat/${chatId}`}
        />
        <Separator />
        <CardContent className="mt-2 space-y-3 overflow-x-auto">
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
          <div className="flex justify-center">
            <CollapseToggle
              show={shouldCollapse}
              collapsed={expanded}
              setCollapsed={setExpanded}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end p-2">
          <BookmarkCardActions
            themeColor={themeColor}
            content={content}
            onUnbookmark={handleToggleBookmark}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

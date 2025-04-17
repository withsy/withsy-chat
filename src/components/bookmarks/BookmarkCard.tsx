import { useState } from "react";

import { MarkdownBox } from "@/components/MarkdownBox";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CollapseToggle } from "../CollapseToggle";
import { BookmarkCardActions } from "./BookmarkCardActions";

interface BookmarkCardProps {
  title?: string;
  messageId: string;
  chatId: string;
  text: string;
  themeColor: string;
  createdAt: string;
  updatedAt: string;
}

export function BookmarkCard({
  chatId,
  messageId,
  title,
  text,
  themeColor,
  createdAt,
}: BookmarkCardProps) {
  const isLongMessage = text.length > 150;
  const [collapsed, setCollapsed] = useState(isLongMessage);
  const [bookmarked, setBookmarked] = useState(true);
  const displayedText = collapsed ? text.slice(0, 150) + "..." : text;

  const handleToggleBookmark = () => {
    setBookmarked(false);
    toast.info("Remove from Saved", {
      description: "This chat has been removed from saved.",
    });
  };

  if (!bookmarked) return null;

  return (
    <div className="relative group">
      <Card>
        {title && (
          <>
            <BookmarkCardHeader
              title={title}
              chattedAt={createdAt}
              link={`/chat/${chatId}?messageId=${messageId}`}
            />
            <Separator />
          </>
        )}
        <CardContent className="mt-2 space-y-3 overflow-x-auto">
          <div className={`transition-all overflow-hidden relative`}>
            <MarkdownBox content={displayedText} />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pl-4 pr-4 pb-2">
          <CollapseToggle
            show={isLongMessage}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
          <BookmarkCardActions
            themeColor={themeColor}
            content={text}
            onUnsave={handleToggleBookmark}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

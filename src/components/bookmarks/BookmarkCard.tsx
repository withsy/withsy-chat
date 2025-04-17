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
  chatId: string;
  text: string;
  themeColor: string;
  createdAt: string;
}

export function BookmarkCard({
  chatId,
  title,
  text,
  themeColor,
  createdAt,
}: BookmarkCardProps) {
  const isLongMessage = text.length > 150;
  const [collapsed, setCollapsed] = useState(isLongMessage);
  const [bookmarked, setBookmarked] = useState(true);

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
              link={`/chat/${chatId}`}
            />
            <Separator />
          </>
        )}
        <CardContent className="mt-2 space-y-3 overflow-x-auto">
          <div
            className={`transition-all overflow-hidden relative ${
              collapsed
                ? isLongMessage
                  ? "max-h-[100px]"
                  : "max-h-full"
                : "max-h-full"
            }`}
          >
            <MarkdownBox content={text} />
            {collapsed && isLongMessage && (
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}
          </div>
          <div className="flex justify-center">
            <CollapseToggle
              show={isLongMessage}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end p-2">
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

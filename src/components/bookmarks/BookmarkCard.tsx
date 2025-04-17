import { useState } from "react";

import { MarkdownBox } from "@/components/MarkdownBox";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { CollapseToggle } from "../CollapseToggle";
import { BookmarkCardActions } from "./BookmarkCardActions";

interface BookmarkCardProps {
  title?: string;
  messageId: number;
  chatId: string;
  text: string | null;
  createdAt: Date;
}

export function BookmarkCard({
  chatId,
  messageId,
  title,
  text,
  createdAt,
}: BookmarkCardProps) {
  const { userPrefs } = useUser();
  const { themeColor } = userPrefs;
  const isLongMessage = text ? text.length > 150 : false;

  const [collapsed, setCollapsed] = useState(isLongMessage);
  const displayedText =
    isLongMessage && collapsed ? text?.slice(0, 150) + "..." : text;

  const [bookmarked, setBookmarked] = useState(true);

  const handleToggleBookmark = () => {
    setBookmarked(false);
    toast.info("Remove from Saved", {
      description: "This chat has been removed from saved.",
    });
  };

  if (!bookmarked) return null;
  if (!text) return null;

  return (
    <div className="relative group">
      <Card>
        {title && (
          <>
            <BookmarkCardHeader
              title={title}
              createdAt={createdAt.toISOString()}
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

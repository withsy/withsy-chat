import { MarkdownBox } from "@/components/MarkdownBox";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { CollapseToggle } from "../CollapseToggle";
import { BookmarkCardActions } from "./BookmarkCardActions";

interface BookmarkCardProps {
  title?: string;
  messageId: string;
  chatId: string;
  text: string | null;
  createdAt: Date;
  hideUnsave?: boolean;
}

export function BookmarkCard({
  chatId,
  messageId,
  title,
  text,
  createdAt,
  hideUnsave,
}: BookmarkCardProps) {
  const { userPrefs } = useUser();
  const { themeColor } = userPrefs;
  const isLongMessage = text ? text.length > 150 : false;

  const [collapsed, setCollapsed] = useState(isLongMessage);
  const displayedText =
    isLongMessage && collapsed ? text?.slice(0, 150) + "..." : text;

  const [bookmarked, setBookmarked] = useState(true);
  const link = `/chat/${chatId}?messageId=${messageId}`;

  const updateMessageMutation = trpc.message.update.useMutation();

  const handleToggleSaved = () => {
    updateMessageMutation.mutate(
      { messageId: messageId, isBookmarked: false },
      {
        onSuccess: () => {
          setBookmarked(false);
          toast.success("Removed from saved", {
            description: "It's no longer in your saved list.",
          });
        },
        onError: () => {
          toast.error("Failed", {
            description: "Please try again or contact support.",
          });
        },
      }
    );
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
              link={link}
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
            link={link}
            onUnsave={handleToggleSaved}
            hideUnsave={hideUnsave}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

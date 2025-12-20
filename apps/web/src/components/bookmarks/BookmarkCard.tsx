import { MarkdownBox } from "@/components/MarkdownBox";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
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
  const trpc = useTRPC();
  const { useUserPreference } = useUserPreferences();
  const themeColor = useUserPreference("themeColor");

  const isLongMessage = text ? text.length > 150 : false;

  const [collapsed, setCollapsed] = useState(isLongMessage);
  const displayedText =
    isLongMessage && collapsed ? text?.slice(0, 150) + "..." : text;

  const [bookmarked, setBookmarked] = useState(true);
  const chatLink = `/chat/${chatId}`;
  const messageLink = `/chat/${chatId}?messageId=${messageId}`;

  const updateMessageMutation = useMutation(
    trpc.message.update.mutationOptions(),
  );

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
      },
    );
  };

  if (!bookmarked) return null;
  if (!text) return null;

  return (
    <div className="group relative">
      <Card>
        {title && (
          <>
            <BookmarkCardHeader
              title={title}
              createdAt={createdAt.toISOString()}
              link={chatLink}
            />
            <Separator />
          </>
        )}
        <CardContent className="mt-2 space-y-3 overflow-x-auto">
          <div className={`relative overflow-hidden transition-all`}>
            <MarkdownBox content={displayedText} />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pr-4 pb-2 pl-4">
          <CollapseToggle
            show={isLongMessage}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
          <BookmarkCardActions
            themeColor={themeColor}
            content={text}
            link={messageLink}
            onUnsave={handleToggleSaved}
            hideUnsave={hideUnsave}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

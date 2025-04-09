import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookmarkCardHeader } from "@/components/bookmarks/BookmarkCardHeader";
import { MarkdownBox } from "@/components/MarkdownBox";

interface BookmarkCardProps {
  type: string;
  //   type: "chat" | "thread";
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
  const chatId = chattedAt; // Replace with actual chat ID or logic to retrieve it
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
      <CardContent className="space-y-3 mt-2">
        <div className="text-sm whitespace-pre-wrap">
          <MarkdownBox content={content} />
        </div>
      </CardContent>
    </Card>
  );
}

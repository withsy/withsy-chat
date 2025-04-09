import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookmarkCardHeader } from "./BookmarkCardHeader";

interface BookmarkCardProps {
  type: string;
  //   type: "chat" | "thread";
  model: string;
  title: string;
  chattedAt: string;
  bookmarkedAt: string;
  content: string;
  note: string;
}

export function BookmarkCard({
  type,
  model,
  title,
  chattedAt,
  bookmarkedAt,
  content,
  note,
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
        <div className="text-sm whitespace-pre-wrap">{content}</div>
        {note && (
          <div className="p-3 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-900 whitespace-pre-wrap">
            {note}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

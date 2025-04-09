import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookmarkCheck, MessageSquareText } from "lucide-react";
import { ContextItem } from "../ContextItem";
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
  const chatId = "12345"; // Replace with actual chat ID or logic to retrieve it
  return (
    <Card>
      <BookmarkCardHeader
        type={type}
        model={model}
        title={title}
        bookmarkedAt={bookmarkedAt}
        chattedAt={chattedAt}
        link={`/chat/${chatId}`} // 링크에 맞게 경로 지정
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

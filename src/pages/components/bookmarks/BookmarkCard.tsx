import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookmarkCardProps } from "@/pages/model/bookmarks";
import { BookmarkCheck, MessageSquareText } from "lucide-react";
import { ContextItem } from "../ContextItem";

export function BookmarkCard({
  type,
  model,
  title,
  chattedAt,
  bookmarkedAt,
  content,
  note,
}: BookmarkCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {type}
            </Badge>
            <Badge>{model}</Badge>
          </div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex gap-x-3 mt-1">
          <ContextItem
            icon={<BookmarkCheck className="w-4 h-4" />}
            date={bookmarkedAt}
          />
          <ContextItem
            icon={<MessageSquareText className="w-4 h-4" />}
            date={chattedAt}
          />
        </div>
      </CardHeader>
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

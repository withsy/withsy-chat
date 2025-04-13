import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookmarkCheck, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookmarkCardHeaderContext } from "./BookmarkCardHeaderContext";

type Props = {
  model: string;
  title: string;
  bookmarkedAt: string;
  chattedAt: string;
  link: string;
  themeColor: string;
};

export function BookmarkCardHeader({
  model,
  title,
  bookmarkedAt,
  chattedAt,
  link,
  themeColor,
}: Props) {
  const router = useRouter();

  return (
    <CardHeader
      onClick={() => router.push(link)}
      className="cursor-pointer transition-colors rounded-md group"
    >
      <div className="flex justify-between items-start mt-1">
        <div className="flex items-center gap-1">
          <CardTitle className="relative group-hover:after:absolute group-hover:after:left-0 group-hover:after:bottom-0 group-hover:after:w-full group-hover:after:h-[1px] group-hover:after:bg-foreground">
            {title}
          </CardTitle>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex gap-x-3 overflow-hidden">
          <BookmarkCardHeaderContext
            icon={<MessageSquareText className="w-4 h-4" />}
            date={chattedAt}
          />
          <BookmarkCardHeaderContext
            icon={<BookmarkCheck className="w-4 h-4" />}
            date={bookmarkedAt}
          />
        </div>
      </div>
    </CardHeader>
  );
}

import { CardTitle, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkCheck, MessageSquareText, ArrowRight } from "lucide-react";
import { ContextItem } from "../ContextItem";
import { useRouter } from "next/navigation";

type Props = {
  type: string;
  model: string;
  title: string;
  bookmarkedAt: string;
  chattedAt: string;
  link: string;
};

export function BookmarkCardHeader({
  type,
  model,
  title,
  bookmarkedAt,
  chattedAt,
  link,
}: Props) {
  const router = useRouter();

  return (
    <CardHeader
      onClick={() => router.push(link)}
      className="cursor-pointer transition-colors rounded-md group"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
          <Badge>{model}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <CardTitle className="text-lg relative group-hover:after:absolute group-hover:after:left-0 group-hover:after:bottom-0 group-hover:after:w-full group-hover:after:h-[1px] group-hover:after:bg-foreground">
          {title}
        </CardTitle>
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
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
  );
}

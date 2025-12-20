import { CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookmarkCardHeaderContext } from "./BookmarkCardHeaderContext";

type Props = {
  title: string;
  createdAt: string;
  link: string;
};

export function BookmarkCardHeader({ title, createdAt, link }: Props) {
  const router = useRouter();

  return (
    <CardHeader
      onClick={() => router.push(link)}
      className="group cursor-pointer rounded-md transition-colors"
    >
      <div className="mt-1 flex items-start justify-between">
        <div className="flex items-center gap-1">
          <CardTitle className="group-hover:after:bg-foreground relative group-hover:after:absolute group-hover:after:bottom-0 group-hover:after:left-0 group-hover:after:h-[1px] group-hover:after:w-full">
            {title}
          </CardTitle>
          <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          <p className="opacity-0 transition-opacity group-hover:opacity-100">
            Go to chat
          </p>
        </div>

        <div className="flex gap-x-3 overflow-hidden">
          <BookmarkCardHeaderContext
            icon={<MessageSquareText className="h-4 w-4" />}
            date={createdAt}
          />
        </div>
      </div>
    </CardHeader>
  );
}

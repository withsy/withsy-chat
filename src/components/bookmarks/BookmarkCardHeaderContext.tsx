import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatSmartDate } from "@/utils/date";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  date: string;
};

export function BookmarkCardHeaderContext({ icon, date }: Props) {
  const display = formatSmartDate(date);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
            {icon}
            <span className="truncate">{display}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{date}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

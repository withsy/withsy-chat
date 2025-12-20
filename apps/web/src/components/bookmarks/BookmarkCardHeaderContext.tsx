import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatSmartDate } from "@/lib/date-utils";
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
          <div className="text-muted-foreground flex min-w-0 items-center gap-1 text-xs">
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

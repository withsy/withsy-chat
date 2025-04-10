import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bookmark as BookmarkIcon, Copy } from "lucide-react";
import { toast } from "sonner";

type Props = {
  content: string;
  onUnbookmark: () => void;
};

export function BookmarkCardActions({ content, onUnbookmark }: Props) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied!", {
      description: "Chat content copied to clipboard.",
    });
  };

  return (
    <TooltipProvider>
      <div className="absolute right-2 z-10 transition-opacity flex gap-2 bg-white rounded-md p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="w-4 h-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onUnbookmark}>
              <BookmarkIcon className="w-4 h-4" fill="black" stroke="black" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Remove bookmark</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

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
  onUnsave: () => void;
  themeColor: string;
};

export function BookmarkCardActions({ content, onUnsave, themeColor }: Props) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied!", {
      description: "Chat content copied to clipboard.",
    });
  };

  return (
    <TooltipProvider>
      <div className="absolute right-2 z-10 transition-opacity flex rounded-md ">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onUnsave}>
              <BookmarkIcon
                className="w-8 h-8"
                style={{
                  fill: `rgb(${themeColor})`,
                }}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Unsave</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

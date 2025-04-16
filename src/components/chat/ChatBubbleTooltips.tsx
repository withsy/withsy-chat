import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Bookmark, Copy, GitBranch, RefreshCw } from "lucide-react";

interface ChatBubbleTooltipsProps {
  isAi: boolean;
  onCopy?: () => void;
  onSave?: () => void;
  onBranch?: () => void;
  onChangeModel?: () => void;
  className?: string;
}

export const ChatBubbleTooltips: React.FC<ChatBubbleTooltipsProps> = ({
  isAi,
  onCopy,
  onSave,
  onBranch,
  onChangeModel,
  className,
}) => {
  return (
    <TooltipProvider>
      <div className={cn("flex gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={onCopy}>
              <Copy className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={onSave}>
              <Bookmark className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={onBranch}>
              <GitBranch className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Branch</TooltipContent>
        </Tooltip>

        {isAi && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={onChangeModel}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Change Model</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

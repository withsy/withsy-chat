import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Bookmark, Copy, GitBranch, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";

interface ChatBubbleTooltipsProps {
  parentId: number | null;
  isAi: boolean;
  isSaved: boolean;
  onCopy?: () => void;
  onSave?: () => void;
  className?: string;
}

export const ChatBubbleTooltips: React.FC<ChatBubbleTooltipsProps> = ({
  parentId,
  isAi,
  isSaved,
  onCopy,
  onSave,
  className,
}) => {
  const router = useRouter();

  const { userPrefs } = useUser();
  const { themeColor } = userPrefs;

  const startBranchChat = trpc.chat.startBranch.useMutation();
  const utils = trpc.useUtils();

  const handleBranch = () => {
    if (!parentId) return;

    startBranchChat.mutate(
      {
        idempotencyKey: uuid(),
        parentMessageId: parentId,
      },
      {
        onSuccess(data) {
          router.push(`/chat/${data.id}`);
          utils.chat.list.invalidate();
        },
      }
    );

    router.push({
      pathname: router.pathname,
      query: { ...router.query, parentId: parentId },
    });
  };

  const handleSwitchModel = () => {
    // TODO 모델 선택 하면 유저가 선택한 모델로 답장이 다시 와야 함.
  };
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
              <Bookmark
                className="w-4 h-4"
                fill={isSaved ? `rgb(${themeColor})` : "transparent"}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>

        {isAi && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={handleBranch}>
                  <GitBranch className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Branch</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={handleSwitchModel}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Switch Model</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

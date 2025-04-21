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
import type { ChatModel } from "@/types/chat";
import { Bookmark, Copy, GitBranch, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import { ModelSelect } from "./ModelSelect";

interface ChatBubbleTooltipsProps {
  parentId: number | null;
  messageModel: ChatModel | null;
  isAi: boolean;
  isSaved: boolean;
  onCopy?: () => void;
  onSave?: () => void;
  className?: string;
}

export const ChatBubbleTooltips: React.FC<ChatBubbleTooltipsProps> = ({
  parentId,
  messageModel,
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
              <ModelSelect
                messageModel={messageModel}
                description={"Switch model & regenerate"}
                onSelectModel={(selectedModel) => {
                  // TODO 여기서 trpc 에 답변 regenerate 부탁!
                  console.log(selectedModel);
                }}
                button={
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                }
              />
              <TooltipContent>Switch model & regenerate</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

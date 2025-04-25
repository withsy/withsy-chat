import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatSession } from "@/context/ChatSessionContext";
import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { MessageReplyRegenerateError } from "@/types/message-reply";
import type { Model } from "@/types/model";
import { Bookmark, Copy, GitBranch, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { ModelSelect } from "./ModelSelect";

interface ChatBubbleTooltipsProps {
  messageId: string;
  messageModel: Model | null;
  isAi: boolean;
  isSaved: boolean;
  onCopy?: () => void;
  onSave?: () => void;
  className?: string;
}

export const ChatBubbleTooltips: React.FC<ChatBubbleTooltipsProps> = ({
  messageId,
  messageModel,
  isAi,
  isSaved,
  onCopy,
  onSave,
  className,
}) => {
  const { onRegenerateSuccess } = useChatSession();

  const router = useRouter();

  const { user } = useUser();

  const chatBranchStart = trpc.chatBranch.start.useMutation({
    onSuccess(data) {
      router.push(`/chat/${data.id}`);
      utils.chat.list.invalidate();
    },
  });

  const messageReplyRegenerate = trpc.messageReply.regenerate.useMutation({
    onSuccess(data) {
      onRegenerateSuccess(data);
    },
    onError(error) {
      const res = MessageReplyRegenerateError.safeParse(error.data);
      // console.error("TODO: handle error data:", res.data);
      toast.error(
        `Message reply regenerating failed. error data: ${JSON.stringify(
          res.data
        )}`
      );
    },
  });
  const utils = trpc.useUtils();

  const handleBranch = () => {
    chatBranchStart.mutate({
      idempotencyKey: uuid(),
      messageId,
    });

    router.push({
      pathname: router.pathname,
      query: { ...router.query, parentId: messageId },
    });
  };

  if (!user) return null;

  const { themeColor } = user.preferences;
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
                  messageReplyRegenerate.mutate({
                    idempotencyKey: uuid(),
                    messageId,
                    model: selectedModel,
                  });
                  // TODO: need to handle on chat session.
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

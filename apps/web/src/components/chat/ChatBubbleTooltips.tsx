import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserPreference } from "@/hooks/useUser";
import { useTRPC } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { Model } from "@repo/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Copy, GitBranch, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { v4 } from "uuid";
import { ModelSelect } from "./ModelSelect";

interface ChatBubbleTooltipsProps {
  chatType: ChatType | undefined;
  messageId: string;
  messageModel: Model | null;
  isAi: boolean;
  isSaved: boolean;
  onCopy?: () => void;
  onSave?: () => void;
  className?: string;
}

export const ChatBubbleTooltips: React.FC<ChatBubbleTooltipsProps> = ({
  chatType,
  messageId,
  messageModel,
  isAi,
  isSaved,
  onCopy,
  onSave,
  className,
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { onRegenerateSuccess } = useChatSession();
  const router = useRouter();
  const themeColor = useUserPreference("themeColor");

  const chatStartBranch = useMutation(
    trpc.chat.startBranch.mutationOptions({
      onSuccess(data) {
        router.push(`/chat/${data.id}`);
        queryClient.invalidateQueries(trpc.chat.list.queryFilter());
      },
    }),
  );

  const messageRegenerateReply = useMutation(
    trpc.message.regenerateReply.mutationOptions({
      onSuccess(data) {
        onRegenerateSuccess(data);
      },
    }),
  );

  const handleBranch = () => {
    chatStartBranch.mutate({
      idempotencyKey: v4(),
      messageId,
    });

    router.push({
      pathname: router.pathname,
      query: { ...router.query, parentId: messageId },
    });
  };

  return (
    <TooltipProvider>
      <div className={cn("flex gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={onCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={onSave}>
              <Bookmark
                className="h-4 w-4"
                fill={isSaved ? `rgb(${themeColor})` : "transparent"}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>

        {isAi && (chatType == "chat" || chatType == "branch") && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={handleBranch}>
                  <GitBranch className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Branch</TooltipContent>
            </Tooltip>

            <Tooltip>
              <ModelSelect
                messageModel={messageModel}
                description={"Switch model & regenerate"}
                onSelectModel={(selectedModel) => {
                  messageRegenerateReply.mutate({
                    idempotencyKey: v4(),
                    messageId,
                    model: selectedModel,
                  });
                }}
                button={
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <RefreshCw className="h-4 w-4" />
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

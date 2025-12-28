import type { ChatId, ChatMessageId } from "@/common-schemas";
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
import { useUserStore } from "@/stores/useUserStore";
import type { Model } from "@repo/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Copy, GitBranch, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { v4 } from "uuid";
import { ModelSelect } from "./ModelSelect";

export default function ChatBubbleTooltips({
  chatMessageId,
}: {
  chatMessageId: ChatMessageId;
}) {
  const themeColor = useUserPreference("themeColor");
  const chatMessage = useUserStore((s) => s.chatMessageMap.get(chatMessageId));
  const chat = useUserStore((s) => s.chatMap.get(chatMessage?.chatId ?? ""));
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  // const chatStartBranch = useMutation(
  //   trpc.chat.startBranch.mutationOptions({
  //     onSuccess(data) {
  //       router.push(`/chat/${data.id}`);
  //       queryClient.invalidateQueries(trpc.chat.list.queryFilter());
  //     },
  //   }),
  // );

  // const messageRegenerateReply = useMutation(
  //   trpc.message.regenerateReply.mutationOptions({
  //     onSuccess(data) {
  //       onRegenerateSuccess(data);
  //     },
  //   }),
  // );

  if (!chatMessage || !chat) {
    return <div />;
  }

  const { text, isBookmarked, role, model } = chatMessage;
  const { type } = chat;

  //   router.push({
  //     pathname: router.pathname,
  //     query: { ...router.query, parentId: messageId },
  //   });
  // };

  const handleBranch = () => {
    // chatStartBranch.mutate({
    //   idempotencyKey: v4(),
    //   messageId,
    // });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!", {
        description: "Message copied to clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed", {
        description: "Please try again or check clipboard permissions.",
      });
    }
  };

  const handleSave = () => {
    // TODO: update chat message isBookmarked.
  };

  const handleSelectModel = (selectedModel: Model) => {
    // messageRegenerateReply.mutate({
    //   idempotencyKey: v4(),
    //   messageId,
    //   model: selectedModel,
    // });
  };

  return (
    <TooltipProvider>
      <div className={"flex gap-2"}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={handleSave}>
              <Bookmark
                className="h-4 w-4"
                fill={isBookmarked ? `rgb(${themeColor})` : "transparent"}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>

        {role === "model" && (type == "chat" || type == "branch") && (
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
                messageModel={model}
                description={"Switch model & regenerate"}
                onSelectModel={handleSelectModel}
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
}

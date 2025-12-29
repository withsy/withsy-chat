import type { ChatMessageId } from "@/common-schemas";
import { isChatMessageCompleted } from "@/lib/chat-utils";
import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { skipToken } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useChatMessageProp } from "./useChatMessage";

export function useChatChunkReceive(chatMessageId: ChatMessageId) {
  const trpc = useTRPC();
  const status = useChatMessageProp(chatMessageId, "status");
  const isNotCompleted = status === "pending" || status === "processing";

  return useSubscription(
    trpc.chatChunk.receive.subscriptionOptions(
      isNotCompleted
        ? {
            chatMessageId,
          }
        : skipToken,
      {
        onStarted: () => {
          useUserStore.setState((state) => {
            const chatMessage = state.chatMessageMap.get(chatMessageId);
            if (chatMessage) {
              if (isChatMessageCompleted(chatMessage.status)) {
                return;
              }

              chatMessage.text = "";
            }
          });
        },
        onData: ({ data }) => {
          useUserStore.setState((state) => {
            const chatMessage = state.chatMessageMap.get(chatMessageId);
            if (chatMessage) {
              if (isChatMessageCompleted(chatMessage.status)) {
                return;
              }

              chatMessage.text += data.text;
              chatMessage.reasoningText += data.reasoningText;
              if (data.isDone) {
                chatMessage.status = "succeeded";
              }
            }
          });
        },
      },
    ),
  );
}

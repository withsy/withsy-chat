import type { ChatMessageId } from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { skipToken } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useChatMessageProp } from "./useChatMessage";

export function useChatMessageChunkReceive(chatMessageId: ChatMessageId) {
  const trpc = useTRPC();
  const status = useChatMessageProp(chatMessageId, "status");
  const isNotCompleted = status === "pending" || status === "processing";

  return useSubscription(
    trpc.chatMessageChunk.receive.subscriptionOptions(
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
              chatMessage.text = "";
            }
          });
        },
        onData: ({ data }) => {
          useUserStore.setState((state) => {
            const chatMessage = state.chatMessageMap.get(chatMessageId);
            if (chatMessage) {
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

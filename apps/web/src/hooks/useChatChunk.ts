import type { ChatId, ChatMessageId } from "@/common-schemas";
import { isChatMessageCompleted } from "@/lib/chat-utils";
import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { skipToken } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useChatMessageProp } from "./useChatMessage";

export function useChatChunkReceive(
  chatId: ChatId,
  chatMessageId: ChatMessageId,
) {
  const trpc = useTRPC();
  const status = useChatMessageProp(chatMessageId, "status");
  const isEnabled = chatId && (status === "pending" || status === "processing");

  return useSubscription(
    trpc.chatChunk.receive.subscriptionOptions(
      isEnabled
        ? {
            chatId,
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
              chatMessage.reasoningText = "";
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

              if (data.isSuccess !== null) {
                chatMessage.status = data.isSuccess ? "succeeded" : "failed";
              }
            }
          });
        },
      },
    ),
  );
}

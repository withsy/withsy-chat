import type { ChatId, ChatMessageId } from "@/common-schemas";
import { isChatMessageCompleted } from "@/lib/chat-utils";
import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { useSubscription } from "@trpc/tanstack-react-query";

export function useChatChunkReceive(input: {
  chatId: ChatId;
  chatMessageId: ChatMessageId;
}) {
  const { chatId, chatMessageId } = input;

  const trpc = useTRPC();

  return useSubscription(
    trpc.chatChunk.receive.subscriptionOptions(
      {
        chatId,
        chatMessageId,
      },
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

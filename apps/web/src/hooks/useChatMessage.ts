import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation } from "@tanstack/react-query";

export function useChatMessageSend() {
  const trpc = useTRPC();

  return useMutation(
    trpc.chatMessage.send.mutationOptions({
      onSuccess: (output) => {
        const { chat, userChatMessage, modelChatMessage } = output;

        useUserStore.setState((state) => {
          if (chat) {
            state.chatMap.set(chat.id, chat);
          }

          if (!state.chatMessageMap.has(userChatMessage.chatId)) {
            state.chatMessageMap.set(userChatMessage.chatId, []);
          }

          const chatMessages = state.chatMessageMap.get(userChatMessage.chatId);
          if (!chatMessages) {
            throw new Error("ChatMessages must exist.");
          }

          chatMessages.push(userChatMessage);
          chatMessages.push(modelChatMessage);
        });
      },
    }),
  );
}

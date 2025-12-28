import type {
  ChatMessageId,
  ChatMessageInfo,
  ChatMessageInfoKey,
} from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";

export function useChatMessageSend() {
  const trpc = useTRPC();
  const router = useRouter();

  return useMutation(
    trpc.chatMessage.send.mutationOptions({
      onSuccess: (output) => {
        const { chat, userChatMessage, modelChatMessage } = output;

        useUserStore.setState((state) => {
          if (chat) {
            state.chatMap.set(chat.id, chat);
          }
        });

        useUserStore.getState().addChatMessage(userChatMessage);
        useUserStore.getState().addChatMessage(modelChatMessage);

        if (chat) {
          router.push(`/chat/${chat.id}`);
        }
      },
    }),
  );
}

export function useChatMessageProp<Key extends ChatMessageInfoKey>(
  chatMessageId: ChatMessageId,
  key: Key,
): ChatMessageInfo[Key] | undefined {
  return useUserStore((s) => s.chatMessageMap.get(chatMessageId)?.[key]);
}

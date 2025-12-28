import type {
  ChatId,
  ChatMessageId,
  ChatMessageInfo,
  ChatMessageInfoKey,
} from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
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

        useUserStore
          .getState()
          .setChatMessages([userChatMessage, modelChatMessage]);

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

export function useChatMessageList(chatId: ChatId) {
  const trpc = useTRPC();
  const user = useUserStore((s) => s.user);

  return useInfiniteQuery(
    trpc.chatMessage.list.infiniteQueryOptions(
      {
        chatId,
      },
      {
        enabled: !!user && !!chatId,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
}

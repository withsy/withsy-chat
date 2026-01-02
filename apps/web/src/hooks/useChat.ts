import type { ChatData, ChatDataKey, ChatId } from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

export function useChatUpdate() {
  const trpc = useTRPC();

  return useMutation(
    trpc.chat.update.mutationOptions({
      onMutate: (input) => {
        const { chatId, ...partialInput } = input;

        const rollbackData = useUserStore.getState().chatMap.get(chatId);
        if (rollbackData) {
          const chat = {
            ...rollbackData,
            ...Object.fromEntries(
              Object.entries(partialInput).filter(
                ([_, value]) => value !== undefined,
              ),
            ),
          };

          useUserStore.setState((state) => {
            state.chatMap.set(chatId, chat);
          });
        }

        return {
          rollbackData,
        };
      },
      onError: (_, __, result) => {
        if (result) {
          const { rollbackData } = result;

          if (rollbackData) {
            useUserStore.setState((state) => {
              state.chatMap.set(rollbackData.id, rollbackData);
            });
          }
        }
      },
      onSuccess: (output) => {
        useUserStore.setState((state) => {
          state.chatMap.set(output.id, output);
        });
      },
    }),
  );
}

export function useChatDelete() {
  const trpc = useTRPC();

  return useMutation(
    trpc.chat.delete.mutationOptions({
      onMutate: (input) => {
        const { chatId } = input;
        const chat = useUserStore.getState().chatMap.get(chatId);
        const chatMessageIdSet = useUserStore
          .getState()
          .chatMessageIdMap.get(chatId);

        const rollbackData = {
          chatId,
          chat,
          chatMessageIdSet,
        };

        useUserStore.getState().deleteChat(chatId);

        return {
          rollbackData,
        };
      },
      onError: (_, __, result) => {
        if (result) {
          const { rollbackData } = result;

          if (rollbackData) {
            const { chatId, chat, chatMessageIdSet } = rollbackData;

            useUserStore.setState((state) => {
              if (chat) {
                state.chatMap.set(chatId, chat);
              }

              if (chatMessageIdSet) {
                state.chatMessageIdMap.set(chatId, chatMessageIdSet);
              }
            });
          }
        }
      },
      onSuccess: (_, input) => {
        const { chatId } = input;

        useUserStore.getState().deleteChat(chatId);
      },
    }),
  );
}

export function useChatProp<Key extends ChatDataKey>(
  chatId: ChatId,
  key: Key,
): ChatData[Key] | undefined {
  return useUserStore((s) => s.chatMap.get(chatId)?.[key]);
}

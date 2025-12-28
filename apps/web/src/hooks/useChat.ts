import type { ChatData, ChatDataKey, ChatId } from "@/common-schemas";
import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

export function useChatList() {
  const trpc = useTRPC();
  const user = useUserStore((s) => s.user);

  return useInfiniteQuery(
    trpc.chat.list.infiniteQueryOptions(
      {},
      {
        enabled: !!user,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
}

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
        const rollbackData = useUserStore.getState().chatMap.get(input.chatId);

        useUserStore.setState((state) => {
          state.chatMap.delete(input.chatId);
        });

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
      onSuccess: (_, input) => {
        useUserStore.setState((state) => {
          state.chatMap.delete(input.chatId);
        });
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

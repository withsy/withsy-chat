import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useChatList() {
  const trpc = useTRPC();
  const session = useSession();

  return useInfiniteQuery(
    trpc.chat.list.infiniteQueryOptions(
      {},
      {
        enabled: session.status === "authenticated",
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

        const old = useUserStore.getState().chatMap.get(chatId);
        if (!old) {
          throw new Error("Chat not found.");
        }

        const chat = {
          ...old,
          ...Object.fromEntries(
            Object.entries(partialInput).filter(
              ([_, value]) => value !== undefined,
            ),
          ),
        };

        useUserStore.setState((state) => {
          state.chatMap.set(chatId, chat);
        });

        return {
          old,
        };
      },
      onError: (_, __, res) => {
        if (res) {
          const { old } = res;
          useUserStore.setState((state) => {
            state.chatMap.set(old.id, old);
          });
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
        const old = useUserStore.getState().chatMap.get(input.chatId);
        if (!old) {
          throw new Error("Chat not found.");
        }

        let doRollbackCurrentChatId = false;
        useUserStore.setState((state) => {
          state.chatMap.delete(input.chatId);

          if (input.chatId === state.currentChatId) {
            state.currentChatId = "";
            doRollbackCurrentChatId = true;
          }
        });

        return {
          old,
          doRollbackCurrentChatId,
        };
      },
      onError: (_, __, res) => {
        if (res) {
          const { old, doRollbackCurrentChatId } = res;

          useUserStore.setState((state) => {
            state.chatMap.set(old.id, old);

            if (doRollbackCurrentChatId) {
              state.currentChatId = old.id;
            }
          });
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

export function useChatListBranch(input: { chatId: string; enabled: boolean }) {
  const { chatId, enabled } = input;

  const trpc = useTRPC();
  const session = useSession();

  return useInfiniteQuery(
    trpc.chat.listBranch.infiniteQueryOptions(
      { chatId },
      {
        enabled: session.status === "authenticated" && enabled,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
}

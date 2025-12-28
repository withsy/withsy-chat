import type {
  ChatData,
  ChatId,
  ChatMessageData,
  ChatMessageId,
  ChatMessageInfo,
  UserData,
  UserPromptData,
} from "@/common-schemas";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const STORE_NAME = "user";

interface UserStore {
  clear: () => void;
  user: UserData | null;
  preferenceFetchingKeySet: Set<string>;
  chatMap: Map<ChatId, ChatData>;
  chatMessageMap: Map<ChatMessageId, ChatMessageInfo>;
  chatMessageIdMap: Map<ChatId, Set<ChatMessageId>>;
  setChatMessages: (chatMessages: ChatMessageData[]) => void;
  userPromptMap: Map<string, UserPromptData>;
}

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set) => ({
      clear: () => {
        set((state) => {
          state.user = null;
          state.preferenceFetchingKeySet.clear();
          state.chatMap.clear();
          state.chatMessageMap.clear();
          state.chatMessageIdMap.clear();
          state.userPromptMap.clear();
        });
      },
      user: null,
      preferenceFetchingKeySet: new Set(),
      chatMap: new Map(),
      chatMessageMap: new Map(),
      chatMessageIdMap: new Map(),
      setChatMessages: (chatMessages) => {
        set((state) => {
          chatMessages.forEach((chatMessage) => {
            state.chatMessageMap.set(chatMessage.id, {
              ...chatMessage,
              isCollapsed: false,
            });

            if (!state.chatMessageIdMap.has(chatMessage.chatId)) {
              state.chatMessageIdMap.set(chatMessage.chatId, new Set());
            }

            state.chatMessageIdMap.get(chatMessage.chatId)!.add(chatMessage.id);
          });
        });
      },
      userPromptMap: new Map(),
    })),
    {
      name: STORE_NAME,
    },
  ),
);

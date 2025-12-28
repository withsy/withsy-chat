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
  chatMessageOrderMap: Map<ChatId, ChatMessageId[]>;
  addChatMessage: (chatMessage: ChatMessageData) => void;
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
          state.chatMessageOrderMap.clear();
          state.userPromptMap.clear();
        });
      },
      user: null,
      preferenceFetchingKeySet: new Set(),
      chatMap: new Map(),
      chatMessageMap: new Map(),
      chatMessageOrderMap: new Map(),
      addChatMessage: (chatMessage) => {
        set((state) => {
          state.chatMessageMap.set(chatMessage.id, {
            ...chatMessage,
            isCollapsed: false,
          });

          if (!state.chatMessageOrderMap.has(chatMessage.chatId)) {
            state.chatMessageOrderMap.set(chatMessage.chatId, []);
          }

          state.chatMessageOrderMap
            .get(chatMessage.chatId)!
            .push(chatMessage.id);
        });
      },
      userPromptMap: new Map(),
    })),
    {
      name: STORE_NAME,
    },
  ),
);

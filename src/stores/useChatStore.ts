import { create } from "zustand";
import type { Chat } from "@/types/chat";

type ChatStore = {
  chat: Chat | null;
  setChat: (chat: Chat | null) => void;
  updatePromptId: (promptId: string | null) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  chat: null,
  setChat: (chat) => set({ chat }),
  updatePromptId: (promptId) =>
    set((state) =>
      state.chat ? { chat: { ...state.chat, userPromptId: promptId } } : {}
    ),
}));

import type { ChatData } from "@/types/chat";
import { create } from "zustand";

type ChatStore = {
  chat: ChatData | null;
  setChat: (chat: ChatData | null) => void;
  updatePromptId: (promptId: string | null) => void;
};

export const useChatStore = create<ChatStore>((set, _get) => ({
  chat: null,
  setChat: (chat) => set({ chat }),
  updatePromptId: (promptId) =>
    set((state) =>
      state.chat ? { chat: { ...state.chat, userPromptId: promptId } } : {}
    ),
}));

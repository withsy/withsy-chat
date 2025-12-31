import type { ChatMessageData } from "@/common-schemas";
import { useState } from "react";
import { create } from "zustand";

function createStore(chatMessage: ChatMessageData) {
  return create<ChatMessageData>()(() => chatMessage);
}

export type ChatMessageStore = ReturnType<typeof createStore>;

export function useChatMessageStore(
  chatMessage: ChatMessageData,
): ChatMessageStore {
  const [store] = useState<ChatMessageStore>(createStore(chatMessage));

  return store;
}

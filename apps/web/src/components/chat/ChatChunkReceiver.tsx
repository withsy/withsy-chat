import type { ChatId, ChatMessageId } from "@/common-schemas";
import { useChatChunkReceive } from "@/hooks/useChatChunk";

export default function ChatChunkReceiver({
  chatId,
  chatMessageId,
}: {
  chatId: ChatId;
  chatMessageId: ChatMessageId;
}) {
  useChatChunkReceive({
    chatId,
    chatMessageId,
  });

  return null;
}

import { z } from "zod";
import { ChatMessageId } from "./chat-message";
import { ChatMessageChunkIndex } from "./chat-message-chunk";
import type { zInfer } from "./common";

export const MessageChunkReceive = z.object({
  messageId: ChatMessageId,
  lastEventId: ChatMessageChunkIndex.optional(),
});
export type MessageChunkReceive = zInfer<typeof MessageChunkReceive>;

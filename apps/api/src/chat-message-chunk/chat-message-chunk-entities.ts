import z from "zod";
import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { zAsyncIterable } from "../z-async-iterable.js";

export const ChatMessageChunkData = z.object({
  get chatMessageId() {
    return ChatMessageId;
  },
  get index() {
    return z.number();
  },
  get text() {
    return z.string();
  },
  get reasoningText() {
    return z.string();
  },
  get isDone() {
    return z.boolean();
  },
});
export type ChatMessageChunkData = z.infer<typeof ChatMessageChunkData>;

export const ChatMessageChunkReceive = z.object({
  lastEventId: z.coerce.number().int().optional(),
});
export type ChatMessageChunkReceive = z.infer<typeof ChatMessageChunkReceive>;

export const ChatMessageChunkReceiveOutput = zAsyncIterable({
  yield: ChatMessageChunkData,
  tracked: true,
});
export type ChatMessageChunkReceiveOutput = z.infer<
  typeof ChatMessageChunkReceiveOutput
>;

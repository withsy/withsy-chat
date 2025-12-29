import z from "zod";
import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { zAsyncIterable } from "../z-async-iterable.js";

export const ChatMessageChunkIndex = z.coerce.number<number | string>().int();
export type ChatMessageChunkIndex = z.infer<typeof ChatMessageChunkIndex>;

export const ChatMessageChunkData = z.object({
  get index() {
    return ChatMessageChunkIndex;
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
  get chatMessageId() {
    return ChatMessageId;
  },
  lastEventId: ChatMessageChunkIndex.optional(),
});
export type ChatMessageChunkReceive = z.infer<typeof ChatMessageChunkReceive>;

export const ChatMessageChunkReceiveOutput = zAsyncIterable({
  yield: ChatMessageChunkData,
  tracked: true,
});
export type ChatMessageChunkReceiveOutput = z.infer<
  typeof ChatMessageChunkReceiveOutput
>;

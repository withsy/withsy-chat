import z from "zod";
import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { zAsyncIterable } from "../z-async-iterable.js";

export const ChatChunkIndex = z.coerce.number<number | string>().int();
export type ChatChunkIndex = z.infer<typeof ChatChunkIndex>;

export const ChatChunkData = z.object({
  get index() {
    return ChatChunkIndex;
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
export type ChatChunkData = z.infer<typeof ChatChunkData>;

export const ChatChunkReceive = z.object({
  get chatMessageId() {
    return ChatMessageId;
  },
  lastEventId: ChatChunkIndex.optional(),
});
export type ChatChunkReceive = z.infer<typeof ChatChunkReceive>;

export const ChatChunkReceiveOutput = zAsyncIterable({
  yield: ChatChunkData,
  tracked: true,
});
export type ChatChunkReceiveOutput = z.infer<typeof ChatChunkReceiveOutput>;

import z from "zod";
import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { ChatId } from "../chat/chat-schemas.js";
import { ChatChunkModel } from "../generated/prisma/models.js";
import { zAsyncIterable } from "../z-async-iterable.js";

export type PartialChatChunkModel = Pick<
  ChatChunkModel,
  "index" | "textEncrypted" | "reasoningTextEncrypted" | "isSuccess"
>;

export const ChatChunkIndex = z.coerce.number<number | string>().int();
export type ChatChunkIndex = z.infer<typeof ChatChunkIndex>;

export const ChatChunkData = z.object({
  get index() {
    return ChatChunkIndex;
  },
  text: z.string(),
  reasoningText: z.string(),
  isSuccess: z.boolean().nullable().default(null),
});
export type ChatChunkData = z.infer<typeof ChatChunkData>;

export const ChatChunkReceive = z.object({
  get chatId() {
    return ChatId;
  },
  get chatMessageId() {
    return ChatMessageId;
  },
  get lastEventId() {
    return ChatChunkIndex.optional();
  },
});
export type ChatChunkReceive = z.infer<typeof ChatChunkReceive>;

export const ChatChunkReceiveOutput = zAsyncIterable({
  get yield() {
    return ChatChunkData;
  },
  tracked: true,
});
export type ChatChunkReceiveOutput = z.infer<typeof ChatChunkReceiveOutput>;

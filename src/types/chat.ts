import { z } from "zod";
import { JsonValue, type zInfer } from "./common";
import { UserId } from "./user";

export const ChatId = z.string().uuid();
export type ChatId = zInfer<typeof ChatId>;

export const Chat = z.object({
  id: ChatId,
  userId: UserId,
  title: z.string(),
  isStarred: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Chat = zInfer<typeof Chat>;

export const UpdateChat = z.object({
  chatId: ChatId,
  title: z.string().optional(),
  isStarred: z.boolean().optional(),
});
export type UpdateChat = zInfer<typeof UpdateChat>;

export const ChatRole = z.enum(["user", "model", "system"]);
export type ChatRole = zInfer<typeof ChatRole>;

export const ChatModel = z.enum(["gemini-2.0-flash"]);
export type ChatModel = zInfer<typeof ChatModel>;

export const ChatMessageId = z.number().int();
export type ChatMessageId = zInfer<typeof ChatMessageId>;

export const ChatMessageStatus = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
]);
export type ChatMessageStatus = zInfer<typeof ChatMessageStatus>;

export const ChatMessage = z.object({
  id: ChatMessageId,
  chatId: ChatId,
  role: ChatRole,
  model: ChatModel.nullable(),
  text: z.string().nullable(),
  status: ChatMessageStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ChatMessage = zInfer<typeof ChatMessage>;

export const StartChat = z.object({
  text: z.string(),
  model: ChatModel,
});
export type StartChat = zInfer<typeof StartChat>;

export const StartChatResult = z.object({
  chat: Chat,
  modelChatMessageId: ChatMessageId,
});
export type StartChatResult = zInfer<typeof StartChatResult>;

export const ListChatMessages = z.object({
  chatId: ChatId,
});
export type ListChatMessages = zInfer<typeof ListChatMessages>;

export const SendChatMessage = z.object({
  chatId: ChatId,
  text: z.string(),
  model: ChatModel,
});
export type SendChatMessage = zInfer<typeof SendChatMessage>;

export const ChatChunkIndex = z.number().int();
export type ChatChunkIndex = zInfer<typeof ChatChunkIndex>;

export const ReceiveChatChunkStream = z.object({
  chatMessageId: ChatMessageId,
  lastEventId: ChatChunkIndex.optional(),
});
export type ReceiveChatChunkStream = zInfer<typeof ReceiveChatChunkStream>;

export const ChatChunk = z.object({
  chatMessageId: ChatMessageId,
  chunkIndex: ChatChunkIndex,
  text: z.string(),
  rawData: JsonValue,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ChatChunk = zInfer<typeof ChatChunk>;

import type { Simplify } from "type-fest";
import { z } from "zod";
import { UserId } from "./user";

export const ChatId = z.string().uuid();
export type ChatId = Simplify<z.infer<typeof ChatId>>;

export const Chat = z.object({
  id: ChatId,
  userId: UserId,
  title: z.string(),
  isStarred: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Chat = Simplify<z.infer<typeof Chat>>;

export const UpdateChat = z.object({
  chatId: ChatId,
  title: z.string().optional(),
  isStarred: z.boolean().optional(),
});
export type UpdateChat = Simplify<z.infer<typeof UpdateChat>>;

export const ChatModel = z.enum(["gemini-2.0-flash"]);
export type ChatModel = Simplify<z.infer<typeof ChatModel>>;

export const StartChat = z.object({
  text: z.string(),
  model: ChatModel,
});
export type StartChat = Simplify<z.infer<typeof StartChat>>;

export const ChatMessageId = z.number().int();
export type ChatMessageId = Simplify<z.infer<typeof ChatMessageId>>;

export const ChatMessageData = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("user"),
    text: z.string(),
    model: ChatModel,
  }),
  z.object({
    role: z.literal("model"),
  }),
]);
export type ChatMessageData = Simplify<z.infer<typeof ChatMessageData>>;

export const ChatMessage = z.object({
  id: ChatMessageId,
  chatId: ChatId,
  data: ChatMessageData,
  isAi: z.boolean(),
  model: z.string(),
  text: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ChatMessage = Simplify<z.infer<typeof ChatMessage>>;

export const ListChatMessages = z.object({
  chatId: ChatId,
});
export type ListChatMessages = Simplify<z.infer<typeof ListChatMessages>>;

export const SendChatMessage = z.object({
  chatId: ChatId,
  text: z.string(),
  model: ChatModel,
});
export type SendChatMessage = Simplify<z.infer<typeof SendChatMessage>>;

export const ReceiveChatMessageStream = z.object({
  chatMessageId: ChatMessageId,
});
export type ReceiveChatMessageStream = Simplify<
  z.infer<typeof ReceiveChatMessageStream>
>;

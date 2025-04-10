import { z } from "zod";

export const Chat = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  isStarred: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Chat = z.infer<typeof Chat>;

export const UpdateChat = z.object({
  chatId: z.string(),
  title: z.string().nullish(),
  isStarred: z.boolean().nullish(),
});
export type UpdateChat = z.infer<typeof UpdateChat>;

export const StartChat = z.object({
  message: z.string(),
  model: z.string(),
});
export type StartChat = z.infer<typeof StartChat>;

export const ChatMessage = z.object({
  id: z.string(),
  chatId: z.string(),
  isAi: z.boolean(),
  model: z.string().nullish(),
  content: z.string(),
  createdAt: z.date(),
  parentId: z.string().nullish(),
  usage: z
    .object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    })
    .nullish(),
});
export type ChatMessage = z.infer<typeof ChatMessage>;

export const ListChatMessages = z.object({
  chatId: z.string(),
});
export type ListChatMessages = z.infer<typeof ListChatMessages>;

export const SendChatMessage = z.object({
  chatId: z.string(),
  message: z.string(),
  model: z.string(),
});
export type SendChatMessage = z.infer<typeof SendChatMessage>;

export const ReceiveChatMessage = z.object({
  chatMessageId: z.string(),
});
export type ReceiveChatMessage = z.infer<typeof ReceiveChatMessage>;

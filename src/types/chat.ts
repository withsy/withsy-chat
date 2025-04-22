import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { ChatId } from "./chat-core";
import { ChatMessageId, ChatMessageSchema } from "./chat-message";
import { zParseDate, type zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { Model } from "./model";

export const ChatSelect = {
  id: true,
  title: true,
  isStarred: true,
  type: true,
  parentMessageId: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export const ChatType = z.enum(["chat", "branch"]);
export type ChatType = zInfer<typeof ChatType>;

export const ChatSchema = z.object({
  id: ChatId,
  title: z.string(),
  isStarred: z.boolean(),
  type: ChatType,
  parentMessageId: ChatMessageId.nullable(),
  updatedAt: zParseDate(),
});
export type ChatSchema = zInfer<typeof ChatSchema>;
const _ = {} satisfies Omit<ChatSchema, keyof typeof ChatSelect>;

export const Chat = ChatSchema.extend({
  parentMessage: ChatMessageSchema.nullable().default(null),
});
export type Chat = zInfer<typeof Chat>;

export const ChatGet = z.object({
  chatId: ChatId,
  options: z
    .object({
      include: z
        .object({
          parentMessage: z.boolean().default(false),
        })
        .optional(),
    })
    .optional(),
});
export type ChatGet = zInfer<typeof ChatGet>;

export const ChatUpdate = z.object({
  chatId: ChatId,
  title: z.string().optional(),
  isStarred: z.boolean().optional(),
});
export type ChatUpdate = zInfer<typeof ChatUpdate>;

export const ChatDelete = z.object({
  chatId: ChatId,
});
export type ChatDelete = zInfer<typeof ChatDelete>;

// NOTE: Define it at this location to avoid circular references.
export const ChatMessage = ChatMessageSchema.extend({
  chat: Chat.nullable().default(null),
});
export type ChatMessage = zInfer<typeof ChatMessage>;

export const ChatStart = z.object({
  idempotencyKey: IdempotencyKey,
  text: z.string(),
  model: Model,
  files: z.array(z.instanceof(File)).optional(),
});
export type ChatStart = zInfer<typeof ChatStart>;

export const ChatStartOutput = z.object({
  chat: Chat,
  userMessage: ChatMessage,
  modelMessage: ChatMessage,
});
export type ChatStartOutput = zInfer<typeof ChatStartOutput>;

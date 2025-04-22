import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { ChatId } from "./chat-core";
import { zParseDate, type zInfer } from "./common";
import { Model } from "./model";
import { Role } from "./role";

export const ChatMessageSelect = {
  id: true,
  chatId: true,
  role: true,
  model: true,
  text: true,
  status: true,
  isBookmarked: true,
  createdAt: true,
  replyToId: true,
} satisfies Prisma.ChatMessageSelect;

export const ChatMessageId = z.number().int();
export type ChatMessageId = zInfer<typeof ChatMessageId>;

export const ChatMessageStatus = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
]);
export type ChatMessageStatus = zInfer<typeof ChatMessageStatus>;

export const ChatMessageSchema = z.object({
  id: ChatMessageId,
  chatId: ChatId,
  role: Role,
  model: Model.nullable(),
  text: z.string(),
  status: ChatMessageStatus,
  isBookmarked: z.boolean(),
  createdAt: zParseDate(),
  replyToId: ChatMessageId.nullable(),
});
export type ChatMessageSchema = zInfer<typeof ChatMessageSchema>;
const _ = {} satisfies Omit<ChatMessageSchema, keyof typeof ChatMessageSelect>;

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { GratitudeJournal, UserPrompt } from ".";
import { ChatPrompt } from "./chat-prompt";
import { type zInfer } from "./common";
import { ChatId, IdempotencyKey, MessageId, UserPromptId } from "./id";
import { Message } from "./message";
import { Model } from "./model";
import { UserUsageLimitError } from "./user-usage-limit";

export const ChatSelect = {
  id: true,
  title: true,
  isStarred: true,
  type: true,
  parentMessageId: true,
  userPromptId: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export const ChatType = z.enum(["chat", "branch", "gratitudeJournal"]);
export type ChatType = zInfer<typeof ChatType>;

export const ChatSchema = z.object({
  id: ChatId,
  title: z.string(),
  isStarred: z.boolean(),
  type: ChatType,
  parentMessageId: MessageId.nullable(),
  userPromptId: UserPromptId.nullable(),
  updatedAt: z.date(),
});
export type ChatSchema = zInfer<typeof ChatSchema>;
const _ = {} satisfies Omit<ChatSchema, keyof typeof ChatSelect>;

export type Chat = {
  id: ChatId;
  title: string;
  isStarred: boolean;
  type: ChatType;
  parentMessageId: MessageId | null;
  parentMessage?: Message | null;
  updatedAt: Date;
  prompts?: ChatPrompt[];
  gratitudeJournals?: GratitudeJournal.Data[];
  userPromptId: UserPromptId | null;
  userPrompt?: UserPrompt.Data | null;
};
export const Chat: z.ZodType<Chat> = ChatSchema.extend({
  parentMessage: Message.nullable().default(null),
  prompts: ChatPrompt.array().default([]),
  gratitudeJournals: z
    .lazy(() => GratitudeJournal.Data)
    .array()
    .default([]),
  userPrompt: UserPrompt.Data.nullable().default(null),
});

export const ChatGet = z.object({
  chatId: ChatId,
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

export const ChatStart = z.object({
  idempotencyKey: IdempotencyKey,
  text: z.string(),
  model: Model,
  files: z.array(z.instanceof(File)).optional(),
});
export type ChatStart = zInfer<typeof ChatStart>;

export const ChatStartOutput = z.object({
  chat: Chat,
  userMessage: Message,
  modelMessage: Message,
});
export type ChatStartOutput = zInfer<typeof ChatStartOutput>;

export const ChatStartError = UserUsageLimitError;

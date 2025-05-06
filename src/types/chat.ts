import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ChatPromptData } from "./chat-prompt";
import { type zInfer } from "./common";
import { GratitudeJournalData } from "./gratitude-journal";
import { ChatId, IdempotencyKey, MessageId, UserPromptId } from "./id";
import * as Message from "./message";
import { Model } from "./model";
import * as UserPrompt from "./user-prompt";
import * as UserUsageLimit from "./user-usage-limit";

export const ChatSelect = {
  id: true,
  titleEncrypted: true,
  isStarred: true,
  type: true,
  parentMessageId: true,
  userPromptId: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export const ChatType = z.enum(["chat", "branch", "gratitudeJournal"]);
export type ChatType = zInfer<typeof ChatType>;

export const ChatEntity = z.object({
  id: ChatId,
  titleEncrypted: z.string(),
  isStarred: z.boolean(),
  type: ChatType,
  parentMessageId: z.nullable(MessageId),
  userPromptId: z.nullable(UserPromptId),
  updatedAt: z.date(),
});
export type ChatEntity = zInfer<typeof ChatEntity>;
const _checkChat = {} satisfies Omit<ChatEntity, keyof typeof ChatSelect>;

export type ChatData = {
  id: ChatId;
  title: string;
  isStarred: boolean;
  type: ChatType;
  parentMessageId: MessageId | null;
  parentMessage?: Message.Data | null;
  updatedAt: Date;
  prompts?: ChatPromptData[];
  gratitudeJournals?: GratitudeJournalData[];
  userPromptId: UserPromptId | null;
  userPrompt?: UserPrompt.Data | null;
};
export const ChatData: z.ZodType<ChatData> = ChatEntity.omit({
  titleEncrypted: true,
}).extend({
  title: z.string(),
  parentMessage: z.nullable(z.lazy(() => Message.Data)).default(null),
  prompts: z.array(z.lazy(() => ChatPromptData)).default([]),
  gratitudeJournals: z.array(z.lazy(() => GratitudeJournalData)).default([]),
  userPrompt: z.nullable(z.lazy(() => UserPrompt.Data)).default(null),
});

export const ChatGet = z.object({
  chatId: ChatId,
});
export type ChatGet = zInfer<typeof ChatGet>;

export const ChatListOutout = z.array(ChatData);
export type ChatListOutout = zInfer<typeof ChatListOutout>;

export const ChatUpdate = z.object({
  chatId: ChatId,
  title: z.optional(z.string()),
  isStarred: z.optional(z.boolean()),
  userPromptId: z.optional(z.nullable(UserPromptId)),
});
export type ChatUpdate = zInfer<typeof ChatUpdate>;

export const ChatDelete = z.object({
  chatId: ChatId,
});
export type ChatDelete = zInfer<typeof ChatDelete>;

export const ChatRestore = z.object({
  chatId: ChatId,
});
export type ChatRestore = zInfer<typeof ChatRestore>;

export const ChatStart = z.object({
  idempotencyKey: IdempotencyKey,
  text: z.string(),
  model: Model,
  files: z.optional(z.array(z.instanceof(File))),
});
export type ChatStart = zInfer<typeof ChatStart>;

export const ChatStartOutput = z.object({
  chat: ChatData,
  userMessage: z.lazy(() => Message.Data),
  modelMessage: z.lazy(() => Message.Data),
});
export type ChatStartOutput = zInfer<typeof ChatStartOutput>;

export const ChatStartError = z.lazy(() => UserUsageLimit.Error);

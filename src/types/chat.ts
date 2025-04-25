import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { type zInfer } from "./common";
import { GratitudeJournal } from "./gratitude-journal";
import { IdempotencyKey } from "./idempotency";
import { Message, MessageId } from "./message";
import { Model } from "./model";
import { Prompt } from "./prompt";
import { UserUsageLimitError } from "./user-usage-limit";

export const ChatSelect = {
  id: true,
  title: true,
  isStarred: true,
  type: true,
  parentMessageId: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export const ChatId = z.string().uuid();
export type ChatId = zInfer<typeof ChatId>;

export const ChatType = z.enum(["chat", "branch"]);
export type ChatType = zInfer<typeof ChatType>;

export const ChatSchema = z.object({
  id: ChatId,
  title: z.string(),
  isStarred: z.boolean(),
  type: ChatType,
  parentMessageId: z.lazy(() => MessageId.nullable()),
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
  prompts?: Prompt[];
  gratitudeJournals?: GratitudeJournal[];
};
export const Chat: z.ZodType<Chat> = z.lazy(() =>
  ChatSchema.extend({
    parentMessage: z.lazy(() => Message.nullable().default(null)),
    prompts: Prompt.array().default([]),
    gratitudeJournals: GratitudeJournal.array().default([]),
  })
);

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

export const ChatStart = z.object({
  idempotencyKey: IdempotencyKey,
  text: z.string(),
  model: Model,
  files: z.array(z.instanceof(File)).optional(),
});
export type ChatStart = zInfer<typeof ChatStart>;

export const ChatStartOutput = z.object({
  chat: Chat,
  userMessage: z.lazy(() => Message),
  modelMessage: z.lazy(() => Message),
});
export type ChatStartOutput = zInfer<typeof ChatStartOutput>;

export const ChatStartError = UserUsageLimitError;

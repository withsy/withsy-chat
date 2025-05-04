import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  ChatPrompt,
  GratitudeJournal,
  Message,
  UserPrompt,
  UserUsageLimit,
} from ".";
import { type zInfer } from "./common";
import { ChatId, IdempotencyKey, MessageId, UserPromptId } from "./id";
import { Model } from "./model";

export const Select = {
  id: true,
  titleEncrypted: true,
  isStarred: true,
  type: true,
  parentMessageId: true,
  userPromptId: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export const Type = z.enum(["chat", "branch", "gratitudeJournal"]);
export type Type = zInfer<typeof Type>;

export const Entity = z.object({
  id: ChatId,
  titleEncrypted: z.string(),
  isStarred: z.boolean(),
  type: Type,
  parentMessageId: z.nullable(MessageId),
  userPromptId: z.nullable(UserPromptId),
  updatedAt: z.date(),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export type Data = {
  id: ChatId;
  title: string;
  isStarred: boolean;
  type: Type;
  parentMessageId: MessageId | null;
  parentMessage?: Message.Data | null;
  updatedAt: Date;
  prompts?: ChatPrompt.Data[];
  gratitudeJournals?: GratitudeJournal.Data[];
  userPromptId: UserPromptId | null;
  userPrompt?: UserPrompt.Data | null;
};
export const Data: z.ZodType<Data> = Entity.omit({
  titleEncrypted: true,
}).extend({
  title: z.string(),
  parentMessage: z.nullable(Message.Data).default(null),
  prompts: z.array(ChatPrompt.Data).default([]),
  gratitudeJournals: z.array(z.lazy(() => GratitudeJournal.Data)).default([]),
  userPrompt: z.nullable(UserPrompt.Data).default(null),
});

export const Get = z.object({
  chatId: ChatId,
});
export type Get = zInfer<typeof Get>;

export const ListOutout = z.array(Data);
export type ListOutout = zInfer<typeof ListOutout>;

export const Update = z.object({
  chatId: ChatId,
  title: z.optional(z.string()),
  isStarred: z.optional(z.boolean()),
  userPromptId: z.optional(z.nullable(UserPromptId)),
});
export type Update = zInfer<typeof Update>;

export const Delete = z.object({
  chatId: ChatId,
});
export type Delete = zInfer<typeof Delete>;

export const Restore = z.object({
  chatId: ChatId,
});
export type Restore = zInfer<typeof Restore>;

export const Start = z.object({
  idempotencyKey: IdempotencyKey,
  text: z.string(),
  model: Model,
  files: z.optional(z.array(z.instanceof(File))),
});
export type Start = zInfer<typeof Start>;

export const StartOutput = z.object({
  chat: Data,
  userMessage: Message.Data,
  modelMessage: Message.Data,
});
export type StartOutput = zInfer<typeof StartOutput>;

export const StartError = UserUsageLimit.Error;

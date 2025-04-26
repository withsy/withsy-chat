import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { Chat, ChatId } from "./chat";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";

export const Select = {
  id: true,
  chatId: true,
} satisfies Prisma.GratitudeJournalSelect;

export const Id = z.string().uuid();
export type Id = zInfer<typeof Id>;

export const Schema = z.object({
  id: Id,
  chatId: z.lazy(() => ChatId),
});
export type Schema = zInfer<typeof Schema>;
const _ = {} satisfies Omit<Schema, keyof typeof Select>;

export type Data = {
  id: Id;
  chatId: ChatId | null;
  chat?: Chat | null;
};
export const Data: z.ZodType<Data> = Schema.extend({
  chat: z.lazy(() => Chat.nullable().default(null)),
});

export const StartChat = z.object({
  idempotencyKey: IdempotencyKey,
});
export type StartChat = zInfer<typeof StartChat>;

export const RecentJournal = z.object({
  zonedDate: z.string(),
  gratitudeJournalId: Id,
});
export type RecentJournal = zInfer<typeof RecentJournal>;

export const Stats = z.object({
  recentJournals: RecentJournal.array(),
  currentStreak: z.number(),
  todayJournal: Data.nullable(),
});
export type Stats = zInfer<typeof Stats>;

export const GetJournal = z.object({
  gratitudeJournalId: Id,
});
export type GetJournal = zInfer<typeof GetJournal>;

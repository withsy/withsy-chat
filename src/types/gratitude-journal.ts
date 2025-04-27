import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { Chat } from "./chat";
import type { zInfer } from "./common";
import { ChatId, GratitudeJournalId, IdempotencyKey } from "./id";

export const Select = {
  id: true,
  chatId: true,
} satisfies Prisma.GratitudeJournalSelect;

export const Schema = z.object({
  id: GratitudeJournalId,
  chatId: ChatId,
});
export type Schema = zInfer<typeof Schema>;
const _ = {} satisfies Omit<Schema, keyof typeof Select>;

export type Data = {
  id: GratitudeJournalId;
  chatId: ChatId | null;
  chat?: Chat | null;
};
export const Data: z.ZodType<Data> = Schema.extend({
  chat: z
    .lazy(() => Chat)
    .nullable()
    .default(null),
});

export const StartChat = z.object({
  idempotencyKey: IdempotencyKey,
});
export type StartChat = zInfer<typeof StartChat>;

export const RecentJournal = z.object({
  zonedDate: z.string(),
  gratitudeJournalId: GratitudeJournalId,
});
export type RecentJournal = zInfer<typeof RecentJournal>;

export const Stats = z.object({
  recentJournals: RecentJournal.array(),
  currentStreak: z.number(),
  todayJournal: Data.nullable(),
});
export type Stats = zInfer<typeof Stats>;

export const GetJournal = z.object({
  gratitudeJournalId: GratitudeJournalId,
});
export type GetJournal = zInfer<typeof GetJournal>;

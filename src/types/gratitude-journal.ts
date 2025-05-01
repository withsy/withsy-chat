import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { Chat } from ".";
import type { zInfer } from "./common";
import { ChatId, GratitudeJournalId, IdempotencyKey } from "./id";

export const Select = {
  id: true,
  chatId: true,
} satisfies Prisma.GratitudeJournalSelect;

export const Entity = z.object({
  id: GratitudeJournalId,
  chatId: z.nullable(ChatId),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export type Data = {
  id: GratitudeJournalId;
  chatId: ChatId | null;
  chat?: Chat.Data | null;
};
export const Data: z.ZodType<Data> = Entity.extend({
  chat: z.nullable(z.lazy(() => Chat.Data)).default(null),
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
  todayJournal: z.nullable(Data),
});
export type Stats = zInfer<typeof Stats>;

export const GetJournal = z.object({
  gratitudeJournalId: GratitudeJournalId,
});
export type GetJournal = zInfer<typeof GetJournal>;

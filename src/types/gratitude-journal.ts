import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { ChatData } from "./chat";
import type { zInfer } from "./common";
import { ChatId, GratitudeJournalId, IdempotencyKey } from "./id";

export const GratitudeJournalSelect = {
  id: true,
  chatId: true,
} satisfies Prisma.GratitudeJournalSelect;

export const GratitudeJournalEntity = z.object({
  id: GratitudeJournalId,
  chatId: z.nullable(ChatId),
});
export type GratitudeJournalEntity = zInfer<typeof GratitudeJournalEntity>;
const _ = {} satisfies Omit<
  GratitudeJournalEntity,
  keyof typeof GratitudeJournalSelect
>;

export type GratitudeJournalData = {
  id: GratitudeJournalId;
  chatId: ChatId | null;
  chat?: ChatData | null;
};
export const GratitudeJournalData: z.ZodType<GratitudeJournalData> =
  GratitudeJournalEntity.extend({
    chat: z.nullable(z.lazy(() => ChatData)).default(null),
  });

export const GratitudeJournalStartChat = z.object({
  idempotencyKey: IdempotencyKey,
});
export type GratitudeJournalStartChat = zInfer<
  typeof GratitudeJournalStartChat
>;

export const GratitudeJournalRecentJournal = z.object({
  zonedDate: z.string(),
  gratitudeJournalId: GratitudeJournalId,
});
export type GratitudeJournalRecentJournal = zInfer<
  typeof GratitudeJournalRecentJournal
>;

export const GratitudeJournalStats = z.object({
  recentJournals: GratitudeJournalRecentJournal.array(),
  currentStreak: z.number(),
  todayJournal: z.nullable(GratitudeJournalData),
});
export type GratitudeJournalStats = zInfer<typeof GratitudeJournalStats>;

export const GratitudeJournalGetJournal = z.object({
  gratitudeJournalId: GratitudeJournalId,
});
export type GratitudeJournalGetJournal = zInfer<
  typeof GratitudeJournalGetJournal
>;

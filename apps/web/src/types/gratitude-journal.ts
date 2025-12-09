import type { Prisma } from "@/server/generated/prisma/client";
import { z } from "zod";
import { ChatData, ChatId } from "./chat";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";

export const GratitudeJournalSelect = {
  id: true,
  chatId: true,
} satisfies Prisma.GratitudeJournalSelect;

export const GratitudeJournalId = z.uuid();
export type GratitudeJournalId = zInfer<typeof GratitudeJournalId>;

export const GratitudeJournalEntity = z.object({
  get id() {
    return GratitudeJournalId;
  },
  get chatId() {
    return ChatId.nullable();
  },
});
export type GratitudeJournalEntity = zInfer<typeof GratitudeJournalEntity>;

const _checkGratitudeJournal = {} satisfies Omit<
  GratitudeJournalEntity,
  keyof typeof GratitudeJournalSelect
>;

export const GratitudeJournalData = GratitudeJournalEntity.extend({
  get chat() {
    return ChatData.nullable().default(null);
  },
});
export type GratitudeJournalData = zInfer<typeof GratitudeJournalData>;

export const GratitudeJournalStartChat = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
});
export type GratitudeJournalStartChat = zInfer<
  typeof GratitudeJournalStartChat
>;

export const GratitudeJournalRecentJournal = z.object({
  zonedDate: z.string(),
  get gratitudeJournalId() {
    return GratitudeJournalId;
  },
});
export type GratitudeJournalRecentJournal = zInfer<
  typeof GratitudeJournalRecentJournal
>;

export const GratitudeJournalStats = z.object({
  get recentJournals() {
    return GratitudeJournalRecentJournal.array();
  },
  currentStreak: z.number(),
  get todayJournal() {
    return GratitudeJournalData.nullable();
  },
});
export type GratitudeJournalStats = zInfer<typeof GratitudeJournalStats>;

export const GratitudeJournalGetJournal = z.object({
  get gratitudeJournalId() {
    return GratitudeJournalId;
  },
});
export type GratitudeJournalGetJournal = zInfer<
  typeof GratitudeJournalGetJournal
>;

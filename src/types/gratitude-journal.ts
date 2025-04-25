import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";

export const GratitudeJournalSelect = {
  id: true,
} satisfies Prisma.GratitudeJournalSelect;

export const GratitudeJournalId = z.number().int();
export type GratitudeJournalId = zInfer<typeof GratitudeJournalId>;

export const GratitudeJournalSchema = z.object({});
export type GratitudeJournalSchema = zInfer<typeof GratitudeJournalSchema>;
const _ = {} satisfies Omit<
  GratitudeJournalSchema,
  keyof typeof GratitudeJournalSelect
>;

export const GratitudeJournal = GratitudeJournalSchema.extend({});
export type GratitudeJournal = zInfer<typeof GratitudeJournal>;

export const GratitudeJournalList = z.object({});
export type GratitudeJournalList = zInfer<typeof GratitudeJournalList>;

export const GratitudeJournalStart = z.object({
  idempotencyKey: IdempotencyKey,
});
export type GratitudeJournalStart = zInfer<typeof GratitudeJournalStart>;

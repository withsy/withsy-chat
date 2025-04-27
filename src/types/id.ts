import { z } from "zod";
import type { zInfer } from "./common";

export const MessageId = z.string().uuid();
export type MessageId = zInfer<typeof MessageId>;

export const ChatId = z.string().uuid();
export type ChatId = zInfer<typeof ChatId>;

export const GratitudeJournalId = z.string().uuid();
export type GratitudeJournalId = zInfer<typeof GratitudeJournalId>;

export const IdempotencyKey = z.string().uuid();
export type IdempotencyKey = zInfer<typeof IdempotencyKey>;

export const MessageChunkIndex = z.number().int();
export type MessageChunkIndex = zInfer<typeof MessageChunkIndex>;

export const UserPromptId = z.string().uuid();
export type UserPromptId = zInfer<typeof UserPromptId>;

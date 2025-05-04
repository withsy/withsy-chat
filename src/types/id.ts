import { z } from "zod";
import type { zInfer } from "./common";

export const UserId = z.string().uuid();
export type UserId = zInfer<typeof UserId>;

export const UserLinkAccountId = z.number().int();
export type UserLinkAccountId = zInfer<typeof UserLinkAccountId>;

export const MessageId = z.string().uuid();
export type MessageId = zInfer<typeof MessageId>;

export const ChatId = z.string().uuid();
export type ChatId = zInfer<typeof ChatId>;

export const ChatPromptId = z.number().int();
export type ChatPromptId = zInfer<typeof ChatPromptId>;

export const GratitudeJournalId = z.string().uuid();
export type GratitudeJournalId = zInfer<typeof GratitudeJournalId>;

export const IdempotencyKey = z.string().uuid();
export type IdempotencyKey = zInfer<typeof IdempotencyKey>;

export const MessageChunkIndex = z.number().int();
export type MessageChunkIndex = zInfer<typeof MessageChunkIndex>;

export const UserPromptId = z.string().uuid();
export type UserPromptId = zInfer<typeof UserPromptId>;

export const UserAiProfileId = z.number().int();
export type UserAiProfileId = zInfer<typeof UserAiProfileId>;

export const UserUsageLimitId = z.number().int();
export type UserUsageLimitId = zInfer<typeof UserUsageLimitId>;

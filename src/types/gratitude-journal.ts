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
  chat?: Chat;
};
export const Data: z.ZodType<Data> = Schema.extend({
  chat: z.lazy(() => Chat),
});

export const StartChat = z.object({
  idempotencyKey: IdempotencyKey,
});
export type StartChat = zInfer<typeof StartChat>;

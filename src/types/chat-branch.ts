import { z } from "zod";
import type { zInfer } from "./common";
import { ChatId, IdempotencyKey, MessageId } from "./id";

export const List = z.object({
  chatId: ChatId,
});
export type List = zInfer<typeof List>;

export const Start = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: MessageId,
});
export type Start = zInfer<typeof Start>;

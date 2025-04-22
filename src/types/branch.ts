import { z } from "zod";
import { ChatId } from "./chat-core";
import { ChatMessageId } from "./chat-message";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";

export const BranchList = z.object({
  chatId: ChatId,
});
export type BranchList = zInfer<typeof BranchList>;

export const BranchStart = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: ChatMessageId,
});
export type BranchStart = zInfer<typeof BranchStart>;

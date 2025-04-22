import { z } from "zod";
import { ChatId } from "./chat";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { MessageId } from "./message";

export const BranchList = z.object({
  chatId: ChatId,
});
export type BranchList = zInfer<typeof BranchList>;

export const BranchStart = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: MessageId,
});
export type BranchStart = zInfer<typeof BranchStart>;

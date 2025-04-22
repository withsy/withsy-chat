import { z } from "zod";
import { ChatId } from "./chat";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { MessageId } from "./message";

export const ChatBranchList = z.object({
  chatId: ChatId,
});
export type ChatBranchList = zInfer<typeof ChatBranchList>;

export const ChatBranchStart = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: MessageId,
});
export type ChatBranchStart = zInfer<typeof ChatBranchStart>;

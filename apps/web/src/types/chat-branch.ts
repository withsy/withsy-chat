import { z } from "zod";
import type { zInfer } from "./common";
import { ChatId, IdempotencyKey, MessageId } from "./id";

export const ChatBranchList = z.object({
  chatId: ChatId,
});
export type ChatBranchList = zInfer<typeof ChatBranchList>;

export const ChatBranchStart = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: MessageId,
});
export type ChatBranchStart = zInfer<typeof ChatBranchStart>;

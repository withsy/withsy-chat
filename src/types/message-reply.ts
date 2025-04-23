import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { MessageId } from "./message";
import { Model } from "./model";
import { UserUsageLimitError } from "./user-usage-limit";

export const MessageReplyRegenerate = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: MessageId,
  model: Model.optional(),
});
export type MessageReplyRegenerate = zInfer<typeof MessageReplyRegenerate>;

export const MessageReplyRegenerateError = UserUsageLimitError;

import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey, MessageId } from "./id";
import { Model } from "./model";
import * as UserUsageLimit from "./user-usage-limit";

export const MessageReplyRegenerate = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: MessageId,
  model: Model.optional(),
});
export type MessageReplyRegenerate = zInfer<typeof MessageReplyRegenerate>;

export const MessageReplyRegenerateError = UserUsageLimit.Error;

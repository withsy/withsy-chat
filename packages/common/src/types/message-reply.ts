import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { MessageId } from "./message";
import { Model } from "./model";
import { UserUsageLimitError } from "./user-usage-limit";

export const MessageReplyRegenerate = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
  get messageId() {
    return MessageId;
  },
  get model() {
    return Model.optional();
  },
});
export type MessageReplyRegenerate = zInfer<typeof MessageReplyRegenerate>;

export const MessageReplyRegenerateError = UserUsageLimitError;
export type MessageReplyRegenerateError = zInfer<
  typeof MessageReplyRegenerateError
>;

import { z } from "zod";
import { ChatMessageId } from "./chat-message";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { Model } from "./model";

export const ReplyRegenerate = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: ChatMessageId,
  model: Model.optional(),
});
export type ReplyRegenerate = zInfer<typeof ReplyRegenerate>;

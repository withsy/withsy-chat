import { z } from "zod";
import { UserUsageLimit } from ".";
import type { zInfer } from "./common";
import { IdempotencyKey, MessageId } from "./id";
import { Model } from "./model";

export const Regenerate = z.object({
  idempotencyKey: IdempotencyKey,
  messageId: MessageId,
  model: Model.optional(),
});
export type Regenerate = zInfer<typeof Regenerate>;

export const RegenerateError = UserUsageLimit.Error;

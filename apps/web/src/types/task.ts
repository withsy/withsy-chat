import { z } from "zod";
import type { zInfer } from "./common";
import { MessageChunkIndex, MessageId } from "./id";

//#region PgEvent

export const MessageChunkCreatedInput = z.object({
  messageId: MessageId,
  index: MessageChunkIndex,
});
export type MessageChunkCreatedInput = zInfer<typeof MessageChunkCreatedInput>;

export const PgEvent = {
  message_chunk_created: MessageChunkCreatedInput,
} as const;

export const PgEventKey = z.enum(
  Object.keys(PgEvent) as [keyof typeof PgEvent]
);
export type PgEventKey = zInfer<typeof PgEventKey>;
export type PgEventInput<K extends PgEventKey> = zInfer<(typeof PgEvent)[K]>;
export type PgEventSchema<K extends PgEventKey> = z.ZodType<PgEventInput<K>>;

//#endregion

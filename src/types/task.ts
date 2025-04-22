import { z } from "zod";
import { ChatMessageId } from "./chat-message";
import { ChatMessageChunkIndex } from "./chat-message-chunk";
import type { MaybePromise, zInfer } from "./common";
import { UserId } from "./user";

//#region Task

export const Task = {
  model_route_send_message_to_ai: z.object({
    userId: UserId,
    userMessageId: ChatMessageId,
    modelMessageId: ChatMessageId,
  }),
  message_cleanup_zombies: z.void(),
} as const;

export type TaskKey = keyof typeof Task;
export type TaskInput<K extends TaskKey> = zInfer<(typeof Task)[K]>;

export type TaskMap = {
  [K in TaskKey]: (input: TaskInput<K>) => MaybePromise<void>;
};

export type CronTask = { cron: string; key: TaskKey };

//#endregion

//#region PgEvent

export const MessageChunkCreatedInput = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("created"),
    messageId: ChatMessageId,
    chunkIndex: ChatMessageChunkIndex,
  }),
  z.object({
    status: z.literal("completed"),
    messageId: ChatMessageId,
  }),
]);
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

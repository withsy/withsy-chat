import { z } from "zod";
import { ChatChunkIndex, ChatMessageId } from "./chat";
import type { MaybePromise, zInfer } from "./common";
import { UserId } from "./user";

//#region Task

export const Task = {
  google_gen_ai_send_chat: z.object({
    userId: UserId,
    userChatMessageId: ChatMessageId,
    modelChatMessageId: ChatMessageId,
  }),
  chat_message_cleanup_zombies: z.void(),
} as const;

export type TaskKey = keyof typeof Task;
export type TaskInput<K extends TaskKey> = zInfer<(typeof Task)[K]>;

export type TaskMap = {
  [K in TaskKey]: (input: TaskInput<K>) => MaybePromise<void>;
};

export type CronTask = { cron: string; key: TaskKey };

//#endregion

//#region PgEvent

export const ChatChunkCreatedInput = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("created"),
    chatMessageId: ChatMessageId,
    chunkIndex: ChatChunkIndex,
  }),
  z.object({
    status: z.literal("completed"),
    chatMessageId: ChatMessageId,
  }),
]);
export type ChatChunkCreatedInput = zInfer<typeof ChatChunkCreatedInput>;

export const PgEvent = {
  chat_chunk_created: ChatChunkCreatedInput,
} as const;

export const PgEventKey = z.enum(
  Object.keys(PgEvent) as [keyof typeof PgEvent]
);
export type PgEventKey = zInfer<typeof PgEventKey>;
export type PgEventInput<K extends PgEventKey> = zInfer<(typeof PgEvent)[K]>;
export type PgEventSchema<K extends PgEventKey> = z.ZodType<PgEventInput<K>>;

//#endregion

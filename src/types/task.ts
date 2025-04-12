import { z } from "zod";
import { ChatChunkIndex, ChatMessageId } from "./chat";
import type { MaybePromise, zInfer } from "./common";

//#region Task

export const Task = {
  googleGenAiSendChat: z.object({
    userChatMessageId: ChatMessageId,
    modelChatMessageId: ChatMessageId,
  }),
  chatMessageCleanupZombies: z.void(),
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
  chatChunkCreated: ChatChunkCreatedInput,
} as const;

export const PgEventKey = z.enum(
  Object.keys(PgEvent) as [keyof typeof PgEvent]
);
export type PgEventKey = zInfer<typeof PgEventKey>;
export type PgEventInput<K extends PgEventKey> = zInfer<(typeof PgEvent)[K]>;
export type PgEventSchema<K extends PgEventKey> = z.ZodType<PgEventInput<K>>;

//#endregion

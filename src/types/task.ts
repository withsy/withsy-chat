import { z } from "zod";
import type { MaybePromise, zInfer } from "./common";
import { MessageChunkIndex, MessageId, UserId } from "./id";

//#region Task

export const Task = {
  model_route_send_message_to_ai: z.object({
    userId: UserId,
    userMessageId: MessageId,
    modelMessageId: MessageId,
  }),
  message_cleanup_zombies: z.void(),
  message_chunk_hard_delete: z.void(),
  chat_hard_delete: z.void(),
  user_prompt_hard_delete: z.void(),
} as const;

export type TaskKey = keyof typeof Task;
export type TaskInput<K extends TaskKey> = zInfer<(typeof Task)[K]>;

export type TaskMap = {
  [K in TaskKey]: (input: TaskInput<K>) => MaybePromise<void>;
};

export type CronTask = { cron: string; key: TaskKey };

//#endregion

//#region Event

export const MessageChunkCreatedInput = z.object({
  index: MessageChunkIndex,
});
export type MessageChunkCreatedInput = zInfer<typeof MessageChunkCreatedInput>;

//#endregion

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { MessageChunkIndex } from "./id";
import * as UserUsageLimit from "./user-usage-limit";

export const MessageChunkSelect = {
  index: true,
  textEncrypted: true,
  reasoningTextEncrypted: true,
  isDone: true,
} satisfies Prisma.MessageChunkSelect;

export const MessageChunkEntity = z.object({
  index: MessageChunkIndex,
  textEncrypted: z.string(),
  reasoningTextEncrypted: z.string(),
  isDone: z.boolean(),
});
export type MessageChunkEntity = zInfer<typeof MessageChunkEntity>;
const _ = {} satisfies Omit<
  MessageChunkEntity,
  keyof typeof MessageChunkSelect
>;

export const MessageChunkData = MessageChunkEntity.omit({
  index: true,
  textEncrypted: true,
  reasoningTextEncrypted: true,
}).extend({
  text: z.string(),
  reasoningText: z.string(),
});
export type MessageChunkData = zInfer<typeof MessageChunkData>;

export const MessageChunkEvent = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("chunk"),
    chunk: MessageChunkData,
  }),
  z.object({
    type: z.literal("usageLimits"),
    usageLimits: z.array(UserUsageLimit.Data),
  }),
]);
export type MessageChunkEvent = zInfer<typeof MessageChunkEvent>;

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { MessageChunkIndex, MessageId } from "./id";
import { UserUsageLimit } from "./user-usage-limit";

export const MessageChunkSelect = {
  text: true,
} satisfies Prisma.MessageChunkSelect;

export const MessageChunkSchema = z.object({
  text: z.string(),
});
export type MessageChunkSchema = zInfer<typeof MessageChunkSchema>;
const _ = {} satisfies Omit<
  MessageChunkSchema,
  keyof typeof MessageChunkSelect
>;

export const MessageChunk = MessageChunkSchema.extend({});
export type MessageChunk = zInfer<typeof MessageChunk>;

export const MessageChunkReceive = z.object({
  messageId: MessageId,
  lastEventId: MessageChunkIndex.optional(),
});
export type MessageChunkReceive = zInfer<typeof MessageChunkReceive>;

export const MessageChunkReceiveData = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("chunk"),
    chunk: MessageChunk,
  }),
  z.object({
    type: z.literal("usageLimit"),
    usageLimit: UserUsageLimit.nullable(),
  }),
]);
export type MessageChunkReceiveData = zInfer<typeof MessageChunkReceiveData>;

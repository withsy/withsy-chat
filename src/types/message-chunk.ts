import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { MessageId } from "./message";

export const MessageChunkSelect = {
  text: true,
} satisfies Prisma.MessageChunkSelect;

export const MessageChunkIndex = z.number().int();
export type MessageChunkIndex = zInfer<typeof MessageChunkIndex>;

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

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const ChatMessageChunkSelect = {
  text: true,
} satisfies Prisma.ChatMessageChunkSelect;

export const ChatMessageChunkIndex = z.number().int();
export type ChatMessageChunkIndex = zInfer<typeof ChatMessageChunkIndex>;

export const ChatMessageChunkSchema = z.object({
  text: z.string(),
});
export type ChatMessageChunkSchema = zInfer<typeof ChatMessageChunkSchema>;
const _ = {} satisfies Omit<
  ChatMessageChunkSchema,
  keyof typeof ChatMessageChunkSelect
>;

export const ChatMessageChunk = ChatMessageChunkSchema.extend({});
export type ChatMessageChunk = zInfer<typeof ChatMessageChunk>;

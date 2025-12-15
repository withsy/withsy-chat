import type { Prisma } from "@/server/generated/prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { UserUsageLimitData } from "./user-usage-limit";

export const MessageChunkSelect = {
  index: true,
  textEncrypted: true,
  reasoningTextEncrypted: true,
  isDone: true,
} satisfies Prisma.MessageChunkSelect;

export const MessageChunkIndex = z.number().int();
export type MessageChunkIndex = zInfer<typeof MessageChunkIndex>;

export const MessageChunkEntity = z.object({
  get index() {
    return MessageChunkIndex;
  },
  textEncrypted: z.string(),
  reasoningTextEncrypted: z.string(),
  isDone: z.boolean(),
});
export type MessageChunkEntity = zInfer<typeof MessageChunkEntity>;

const _checkMessageChunk = {} satisfies Omit<
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
    get chunk() {
      return MessageChunkData;
    },
  }),
  z.object({
    type: z.literal("usageLimits"),
    get usageLimits() {
      return UserUsageLimitData.array();
    },
  }),
]);
export type MessageChunkEvent = zInfer<typeof MessageChunkEvent>;

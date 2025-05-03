import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { MessageChunkIndex, MessageId } from "./id";
import { UserUsageLimit } from "./user-usage-limit";

export const Select = {
  index: true,
  textEncrypted: true,
  reasoningTextEncrypted: true,
  isDone: true,
} satisfies Prisma.MessageChunkSelect;

export const Entity = z.object({
  index: MessageChunkIndex,
  textEncrypted: z.string(),
  reasoningTextEncrypted: z.string(),
  isDone: z.boolean(),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Data = Entity.omit({
  index: true,
  textEncrypted: true,
  reasoningTextEncrypted: true,
}).extend({
  text: z.string(),
  reasoningText: z.string(),
});
export type Data = zInfer<typeof Data>;

export const Event = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("chunk"),
    chunk: Data,
  }),
  z.object({
    type: z.literal("usageLimit"),
    usageLimit: z.nullable(UserUsageLimit),
  }),
]);
export type Event = zInfer<typeof Event>;

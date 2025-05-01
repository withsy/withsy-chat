import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { ChatPromptId } from "./id";

export const Select = {
  id: true,
  textEncrypted: true,
} satisfies Prisma.ChatPromptSelect;

export const Entity = z.object({
  id: ChatPromptId,
  textEncrypted: z.string(),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Data = Entity.omit({ id: true, textEncrypted: true }).extend({
  text: z.optional(z.string()),
});
export type Data = zInfer<typeof Data>;

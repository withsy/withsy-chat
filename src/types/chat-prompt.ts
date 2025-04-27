import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const ChatPromptSelect = { id: true } satisfies Prisma.ChatPromptSelect;

export const ChatPromptSchema = z.object({});
export type ChatPromptSchema = zInfer<typeof ChatPromptSchema>;
const _ = {} satisfies Omit<ChatPromptSchema, keyof typeof ChatPromptSelect>;

export const ChatPrompt = ChatPromptSchema.extend({
  text: z.string().optional(),
});
export type ChatPrompt = zInfer<typeof ChatPrompt>;

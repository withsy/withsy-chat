import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { PromptId } from "./prompt";

export const ChatPromptSelect = {
  parentPromptId: true,
} satisfies Prisma.ChatPromptSelect;

export const ChatPromptSchema = z.object({
  parentPromptId: PromptId,
});
export type ChatPromptSchema = zInfer<typeof ChatPromptSchema>;
const _ = {} satisfies Omit<ChatPromptSchema, keyof typeof ChatPromptSelect>;

export const ChatPrompt = ChatPromptSchema.extend({});
export type ChatPrompt = zInfer<typeof ChatPrompt>;

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { ChatPromptId } from "./id";

export const ChatPromptSelect = {
  id: true,
  textEncrypted: true,
} satisfies Prisma.ChatPromptSelect;

export const ChatPromptEntity = z.object({
  id: ChatPromptId,
  textEncrypted: z.string(),
});
export type ChatPromptEntity = zInfer<typeof ChatPromptEntity>;
const _checkChatPrompt = {} satisfies Omit<
  ChatPromptEntity,
  keyof typeof ChatPromptSelect
>;

export const ChatPromptData = ChatPromptEntity.omit({
  id: true,
  textEncrypted: true,
}).extend({
  text: z.optional(z.string()),
});
export type ChatPromptData = zInfer<typeof ChatPromptData>;

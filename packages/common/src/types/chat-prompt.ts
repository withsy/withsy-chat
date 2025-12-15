import type { Prisma } from "@/server/generated/prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const ChatPromptSelect = {
  id: true,
  textEncrypted: true,
} satisfies Prisma.ChatPromptSelect;

export const ChatPromptId = z.number().int();
export type ChatPromptId = zInfer<typeof ChatPromptId>;

export const ChatPromptEntity = z.object({
  get id() {
    return ChatPromptId;
  },
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
  text: z.string().nullable().default(null),
});
export type ChatPromptData = zInfer<typeof ChatPromptData>;

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const ChatMessageFileSelect = {
  fileUri: true,
  mimeType: true,
} satisfies Prisma.ChatMessageFileSelect;

export const ChatMessageFileId = z.number().int();
export type ChatMessageFileId = zInfer<typeof ChatMessageFileId>;

export const ChatMessageFileSchema = z.object({
  fileUri: z.string(),
  mimeType: z.string(),
});
export type ChatMessageFileSchema = zInfer<typeof ChatMessageFileSchema>;
const _ = {} satisfies Omit<
  ChatMessageFileSchema,
  keyof typeof ChatMessageFileSelect
>;

export const ChatMessageFile = ChatMessageFileSchema.extend({});
export type ChatMessageFile = zInfer<typeof ChatMessageFile>;

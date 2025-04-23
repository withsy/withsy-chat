import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const MessageFileSelect = {
  fileUri: true,
  mimeType: true,
} satisfies Prisma.MessageFileSelect;

export const MessageFileId = z.number().int();
export type MessageFileId = zInfer<typeof MessageFileId>;

export const MessageFileSchema = z.object({
  fileUri: z.string(),
  mimeType: z.string(),
});
export type MessageFileSchema = zInfer<typeof MessageFileSchema>;
const _ = {} satisfies Omit<MessageFileSchema, keyof typeof MessageFileSelect>;

export const MessageFile = MessageFileSchema.extend({});
export type MessageFile = zInfer<typeof MessageFile>;

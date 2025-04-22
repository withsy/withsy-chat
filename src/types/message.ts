import { z } from "zod";
import { ChatMessage } from "./chat";
import { ChatId } from "./chat-core";
import { ChatMessageId } from "./chat-message";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { Model } from "./model";
import { Role } from "./role";
import { UserId } from "./user";

export const MessageList = z.object({
  role: Role.optional(),
  isBookmarked: z.boolean().optional(),
  options: z.object({
    scope: z.discriminatedUnion("by", [
      z.object({ by: z.literal("user"), userId: UserId }),
      z.object({ by: z.literal("chat"), chatId: ChatId }),
    ]),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
    limit: z.number().int().min(1).max(100).optional().default(100),
    afterId: ChatMessageId.optional(),
    include: z
      .object({
        chat: z.boolean().optional().default(false),
      })
      .optional(),
  }),
});
export type MessageList = zInfer<typeof MessageList>;

export type MessageForHistory = {
  role: string;
  text: string;
};

export const MessageSend = z.object({
  idempotencyKey: IdempotencyKey,
  chatId: ChatId,
  text: z.string(),
  model: Model,
  files: z.array(z.instanceof(File)).optional(),
});
export type MessageSend = zInfer<typeof MessageSend>;

export const MessageSendOutput = z.object({
  userMessage: ChatMessage,
  modelMessage: ChatMessage,
});
export type MessageSendOutput = zInfer<typeof MessageSendOutput>;

export const MessageUpdate = z.object({
  messageId: ChatMessageId,
  isBookmarked: z.boolean().optional(),
});
export type MessageUpdate = zInfer<typeof MessageUpdate>;

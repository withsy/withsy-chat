import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { ChatData } from "./chat";
import { type zInfer } from "./common";
import { ChatId, IdempotencyKey, MessageId, UserId } from "./id";
import { Model } from "./model";
import { Role } from "./role";
import * as UserUsageLimit from "./user-usage-limit";

export const MessageSelect = {
  id: true,
  chatId: true,
  role: true,
  model: true,
  textEncrypted: true,
  reasoningTextEncrypted: true,
  status: true,
  isBookmarked: true,
  parentMessageId: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

export const MessageStatus = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
]);
export type MessageStatus = zInfer<typeof MessageStatus>;

export function isMessageComplete(data: MessageData) {
  return data.status === "succeeded" || data.status === "failed";
}

export const MessageEntity = z.object({
  id: MessageId,
  chatId: ChatId,
  role: z.string(),
  model: z.nullable(z.string()),
  textEncrypted: z.string(),
  reasoningTextEncrypted: z.string(),
  status: MessageStatus,
  isBookmarked: z.boolean(),
  parentMessageId: z.nullable(MessageId),
  createdAt: z.date(),
});
export type MessageEntity = zInfer<typeof MessageEntity>;
const _checkMessage = {} satisfies Omit<
  MessageEntity,
  keyof typeof MessageSelect
>;

export type MessageData = {
  id: MessageId;
  chatId: ChatId;
  chat?: ChatData | null;
  role: Role;
  model: Model | null;
  text: string;
  reasoningText: string;
  status: MessageStatus;
  isBookmarked: boolean;
  createdAt: Date;
  parentMessageId: MessageId | null;
  parentMessage?: MessageData | null;
};
export const MessageDataBase: z.ZodType<MessageData> = MessageEntity.omit({
  textEncrypted: true,
  reasoningTextEncrypted: true,
  role: true,
  model: true,
}).extend({
  text: z.string(),
  reasoningText: z.string(),
  role: Role,
  model: z.nullable(Model),
  chat: z.nullable(z.lazy(() => ChatData)).default(null),
  parentMessage: z.nullable(z.lazy(() => MessageDataBase)).default(null),
});
export const MessageData = MessageDataBase;

export const MessageGet = z.object({
  messageId: MessageId,
});
export type MessageGet = zInfer<typeof MessageGet>;

export const MessageGetOutput = z.nullable(MessageData);
export type MessageGetOutput = zInfer<typeof MessageGetOutput>;

export const MessageList = z.object({
  role: z.optional(Role),
  isBookmarked: z.optional(z.boolean()),
  options: z.object({
    scope: z.discriminatedUnion("by", [
      z.object({ by: z.literal("user"), userId: UserId }),
      z.object({ by: z.literal("chat"), chatId: ChatId }),
    ]),
    order: z.optional(z.enum(["asc", "desc"])).default("asc"),
    limit: z.optional(z.number().int().min(1).max(100)).default(100),
    afterId: z.optional(MessageId),
    include: z.optional(
      z.object({
        chat: z.optional(z.boolean()).default(false),
      })
    ),
  }),
});
export type MessageList = zInfer<typeof MessageList>;

export const MessageListOutput = z.array(MessageData);
export type MessageListOutput = zInfer<typeof MessageListOutput>;

export type MessageEntityForAi = {
  role: string;
  textEncrypted: string;
};

export type MessageDataForAi = {
  role: string;
  text: string;
};

export const MessageSend = z.object({
  idempotencyKey: IdempotencyKey,
  chatId: ChatId,
  text: z.string(),
  model: Model,
});
export type MessageSend = zInfer<typeof MessageSend>;

export const MessageSendOutput = z.object({
  userMessage: MessageData,
  modelMessage: MessageData,
});
export type MessageSendOutput = zInfer<typeof MessageSendOutput>;

export const MessageSendError = UserUsageLimit.Error;

export const MessageUpdate = z.object({
  messageId: MessageId,
  isBookmarked: z.optional(z.boolean()),
});
export type MessageUpdate = zInfer<typeof MessageUpdate>;

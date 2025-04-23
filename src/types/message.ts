import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { Chat, ChatId } from "./chat";
import { type zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { Model } from "./model";
import { Role } from "./role";
import { UserId } from "./user";
import { UserUsageLimitError } from "./user-usage-limit";

export const MessageSelect = {
  id: true,
  chatId: true,
  role: true,
  model: true,
  text: true,
  status: true,
  isBookmarked: true,
  parentMessageId: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

export const MessageId = z.string().uuid();
export type MessageId = zInfer<typeof MessageId>;

export const MessageStatus = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
]);
export type MessageStatus = zInfer<typeof MessageStatus>;

export const MessageSchema = z.object({
  id: MessageId,
  chatId: z.lazy(() => ChatId),
  role: Role,
  model: Model.nullable(),
  text: z.string(),
  status: MessageStatus,
  isBookmarked: z.boolean(),
  parentMessageId: MessageId.nullable(),
  createdAt: z.date(),
});
export type MessageSchema = zInfer<typeof MessageSchema>;
const _ = {} satisfies Omit<MessageSchema, keyof typeof MessageSelect>;

export type Message = {
  id: MessageId;
  chatId: ChatId;
  chat?: Chat | null;
  role: Role;
  model: Model | null;
  text: string;
  status: MessageStatus;
  isBookmarked: boolean;
  createdAt: Date;
  parentMessageId: MessageId | null;
  parentMessage?: Message | null;
};
export const MessageBase: z.ZodType<Message> = z.lazy(() =>
  MessageSchema.extend({
    chat: z.lazy(() => Chat.nullable().default(null)),
    parentMessage: z.lazy(() => MessageBase.nullable().default(null)),
  })
);
export const Message = MessageBase;

export const MessageList = z.object({
  role: Role.optional(),
  isBookmarked: z.boolean().optional(),
  options: z.object({
    scope: z.discriminatedUnion("by", [
      z.object({ by: z.literal("user"), userId: UserId }),
      z.object({ by: z.literal("chat"), chatId: z.lazy(() => ChatId) }),
    ]),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
    limit: z.number().int().min(1).max(100).optional().default(100),
    afterId: MessageId.optional(),
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
  chatId: z.lazy(() => ChatId),
  text: z.string(),
  model: Model,
  files: z.array(z.instanceof(File)).optional(),
});
export type MessageSend = zInfer<typeof MessageSend>;

export const MessageSendOutput = z.object({
  userMessage: Message,
  modelMessage: Message,
});
export type MessageSendOutput = zInfer<typeof MessageSendOutput>;

export const MessageSendError = UserUsageLimitError;

export const MessageUpdate = z.object({
  messageId: MessageId,
  isBookmarked: z.boolean().optional(),
});
export type MessageUpdate = zInfer<typeof MessageUpdate>;

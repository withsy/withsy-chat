import { z, ZodType } from "zod";
import { ChatId } from "./chat";
import { DateTimeTz, type zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { Model } from "./model";
import { Role } from "./role";
import { UserId } from "./user";
import { UserUsageLimitError } from "./user-usage-limit";

export const MessageId = z.uuid();
export type MessageId = zInfer<typeof MessageId>;

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

export type MessageData = {
  id: MessageId;
  chatId: ChatId;
  status: MessageStatus;
  isBookmarked: boolean;
  role: Role;
  model: string | null;
  text: string;
  reasoningText: string;
  parentMessageId: MessageId | null;
  createdAt: DateTimeTz;
};
export const MessageDataBase: ZodType<MessageData> = z.object({
  get id() {
    return MessageId;
  },
  get chatId() {
    return ChatId;
  },
  get status() {
    return MessageStatus;
  },
  isBookmarked: z.boolean(),
  get role() {
    return Role;
  },
  model: z.string(),
  text: z.string(),
  reasoningText: z.string(),
  get parentMessageId() {
    return MessageId.nullable();
  },
  get createdAt() {
    return DateTimeTz;
  },
});
export const MessageData = MessageDataBase;

export const MessageGet = z.object({
  get messageId() {
    return MessageId;
  },
});
export type MessageGet = zInfer<typeof MessageGet>;

export const MessageGetOutput = MessageData.nullable();
export type MessageGetOutput = zInfer<typeof MessageGetOutput>;

export const MessageList = z.object({
  get role() {
    return Role.optional();
  },
  isBookmarked: z.boolean().optional(),
  options: z.object({
    scope: z.discriminatedUnion("by", [
      z.object({
        by: z.literal("user"),
        get userId() {
          return UserId;
        },
      }),
      z.object({
        by: z.literal("chat"),
        get chatId() {
          return ChatId;
        },
      }),
    ]),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
    limit: z.number().int().min(1).max(100).optional().default(100),
    get afterId() {
      return MessageId.optional();
    },
    include: z
      .object({
        chat: z.boolean().optional().default(false),
      })
      .optional(),
  }),
});
export type MessageList = zInfer<typeof MessageList>;

export const MessageListOutput = MessageData.array();
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
  get idempotencyKey() {
    return IdempotencyKey;
  },
  get chatId() {
    return ChatId;
  },
  text: z.string(),
  get model() {
    return Model;
  },
});
export type MessageSend = zInfer<typeof MessageSend>;

export const MessageSendOutput = z.object({
  get userMessage() {
    return MessageData;
  },
  get modelMessage() {
    return MessageData;
  },
});
export type MessageSendOutput = zInfer<typeof MessageSendOutput>;

export const MessageSendError = UserUsageLimitError;
export type MessageSendError = zInfer<typeof MessageSendError>;

export const MessageUpdate = z.object({
  get messageId() {
    return MessageId;
  },
  isBookmarked: z.boolean().optional(),
});
export type MessageUpdate = zInfer<typeof MessageUpdate>;

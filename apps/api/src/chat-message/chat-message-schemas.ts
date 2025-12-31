import { Model } from "@repo/common";
import z from "zod";
import { ChatData, ChatId } from "../chat/chat-schemas.js";
import {
  createListSchemas,
  DateTimeTz,
  Order,
  Role,
} from "../common-schemas.js";
import { IdempotencyKey } from "../idempotency-key/idempotency-key-schemas.js";

export const ChatMessageId = z.uuid();
export type ChatMessageId = z.infer<typeof ChatMessageId>;

export const ChatMessageStatus = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
]);
export type ChatMessageStatus = z.infer<typeof ChatMessageStatus>;

export const ChatMessageData = z.object({
  get id() {
    return ChatMessageId;
  },
  get chatId() {
    return ChatId;
  },
  get chat() {
    return ChatData.pick({ title: true }).optional();
  },
  get role() {
    return Role;
  },
  text: z.string(),
  reasoningText: z.string(),
  get status() {
    return ChatMessageStatus;
  },
  isBookmarked: z.boolean(),
  get createdAt() {
    return DateTimeTz;
  },
  model: z.string().nullable(),
});
export type ChatMessageData = z.infer<typeof ChatMessageData>;

export const chatMessageListSchemas = createListSchemas(ChatMessageData);

export const ChatMessageList = chatMessageListSchemas.list.extend({
  get chatId() {
    return ChatId.optional();
  },
  get order() {
    return Order.optional();
  },
  isBookmarked: z.boolean().optional(),
  withChatTitle: z.boolean().optional(),
});
export type ChatMessageList = z.infer<typeof ChatMessageList>;

export const ChatMessageListOutput = chatMessageListSchemas.listOutput;
export type ChatMessageListOutput = z.infer<typeof ChatMessageListOutput>;

export const ChatMessageSend = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
  text: z.string(),
  get model() {
    return Model;
  },
  get chatId() {
    return ChatId.optional();
  },
});
export type ChatMessageSend = z.infer<typeof ChatMessageSend>;

export const ChatMessageSendOutput = z.object({
  get chat() {
    return ChatData.nullable().default(null);
  },
  get userChatMessage() {
    return ChatMessageData;
  },
  get modelChatMessage() {
    return ChatMessageData;
  },
});

export type ChatMessageSendOutput = z.infer<typeof ChatMessageSendOutput>;

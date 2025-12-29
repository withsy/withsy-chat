import { Model } from "@repo/common";
import z from "zod";
import { ChatData, ChatId, ChatType } from "../chat/chat-schemas.js";
import { createListSchemas, DateTimeTz, Role } from "../common-schemas.js";
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
  get role() {
    return Role;
  },
  text: z.string(),
  reasoningText: z.string(),
  get status() {
    return ChatMessageStatus;
  },
  isBookmarked: z.boolean(),
  createdAt: DateTimeTz,
  model: z.string().nullable(),
});
export type ChatMessageData = z.infer<typeof ChatMessageData>;

const chatMessageListSchemas = createListSchemas(ChatMessageData);

export const ChatMessageList = chatMessageListSchemas.list.extend({
  get chatId() {
    return ChatId;
  },
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
  get type() {
    return ChatType.optional();
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

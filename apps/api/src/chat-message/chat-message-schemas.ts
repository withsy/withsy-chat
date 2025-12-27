import { Model } from "@repo/api-shared";
import z from "zod";
import { ChatData, ChatId } from "../chat/chat-schemas";
import { createListSchemas } from "../common-schemas";
import { IdempotencyKey } from "../idempotency-key/idempotency-key-schemas";

export const ChatMessageId = z.uuid();
export type ChatMessageId = z.infer<typeof ChatMessageId>;

export const ChatMessageData = z.object({
  get id() {
    return ChatMessageId;
  },
});
export type ChatMessageData = z.infer<typeof ChatMessageData>;

const chatMessageListSchemas = createListSchemas(ChatMessageData);

export const ChatMessageList = chatMessageListSchemas.list;
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

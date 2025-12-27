import { Model } from "@repo/api-shared";
import z from "zod";
import { ChatMessageId } from "../chat-message/chat-message-schemas";
import {
  createListSchemas,
  createResultSchema,
  DateTimeTz,
} from "../common-schemas";
import { IdempotencyKey } from "../idempotency-key/idempotency-key-schemas";
import { UserPromptId } from "../user-prompt/user-prompt-schemas";

export const ChatId = z.uuid();
export type ChatId = z.infer<typeof ChatId>;

export const ChatData = z.object({
  get id() {
    return ChatId;
  },
  title: z.string(),
  isStarred: z.boolean(),
  type: z.string(),
  get userPromptId() {
    return UserPromptId.nullable();
  },
  get updatedAt() {
    return DateTimeTz;
  },
});
export type ChatData = z.infer<typeof ChatData>;

const chatListSchemas = createListSchemas(ChatData);

export const ChatList = chatListSchemas.list;
export type ChatList = z.infer<typeof ChatList>;

export const ChatListOutput = chatListSchemas.listOutput;
export type ChatListOutput = z.infer<typeof ChatListOutput>;

export const ChatUpdate = z.object({
  get chatId() {
    return ChatId;
  },
  title: z.string().optional(),
  isStarred: z.boolean().optional(),
  get userPromptId() {
    return UserPromptId.nullish();
  },
});
export type ChatUpdate = z.infer<typeof ChatUpdate>;

export const ChatDelete = z.object({
  get chatId() {
    return ChatId;
  },
});
export type ChatDelete = z.infer<typeof ChatDelete>;

export const ChatStart = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
  text: z.string(),
  get model() {
    return Model;
  },
});
export type ChatStart = z.infer<typeof ChatStart>;

export const ChatStartOutput = createResultSchema(
  z.object({
    get chat() {
      return ChatData;
    },
    get userChatMessageId() {
      return ChatMessageId;
    },
    get modelChatMessageId() {
      return ChatMessageId;
    },
  }),
  z.object({}),
);

export type ChatStartOutput = z.infer<typeof ChatStartOutput>;

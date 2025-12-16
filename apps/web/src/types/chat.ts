import type { Prisma } from "@/server/generated/prisma/client";
import { z, ZodType } from "zod";
import { DateTimeTz, type zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { MessageData, MessageId } from "./message";
import { Model } from "./model";
import { UserPromptData, UserPromptId } from "./user-prompt";
import { UserUsageLimitError } from "./user-usage-limit";

export const ChatSelect = {
  id: true,
  titleEncrypted: true,
  isStarred: true,
  type: true,
  parentMessageId: true,
  userPromptId: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export const ChatId = z.uuid();
export type ChatId = zInfer<typeof ChatId>;

export const ChatType = z.enum(["chat", "branch", "gratitudeJournal"]);
export type ChatType = zInfer<typeof ChatType>;

export const ChatEntity = z.object({
  get id() {
    return ChatId;
  },
  titleEncrypted: z.string(),
  isStarred: z.boolean(),
  get type() {
    return ChatType;
  },
  get parentMessageId() {
    return MessageId.nullable();
  },
  get userPromptId() {
    return UserPromptId.nullable();
  },
  get updatedAt() {
    return DateTimeTz;
  },
});
export type ChatEntity = zInfer<typeof ChatEntity>;

const _checkChat = {} satisfies Omit<ChatEntity, keyof typeof ChatSelect>;

export type ChatData = {
  id: ChatId;
  title: string;
  isStarred: boolean;
  type: ChatType;
  parentMessageId: MessageId | null;
  parentMessage: MessageData | null;
  userPromptId: UserPromptId | null;
  userPrompt: UserPromptData | null;
  updatedAt: DateTimeTz;
};
export const ChatData: ZodType<ChatData> = ChatEntity.omit({
  titleEncrypted: true,
}).extend({
  title: z.string(),
  get parentMessage() {
    return MessageData.nullable().default(null);
  },
  get userPrompt() {
    return UserPromptData.nullable().default(null);
  },
});

export const ChatGet = z.object({
  get chatId() {
    return ChatId;
  },
});
export type ChatGet = zInfer<typeof ChatGet>;

export const ChatListOutout = ChatData.array();
export type ChatListOutout = zInfer<typeof ChatListOutout>;

export const ChatUpdate = z.object({
  get chatId() {
    return ChatId;
  },
  title: z.string().optional(),
  isStarred: z.boolean().optional(),
  get userPromptId() {
    return UserPromptId.nullable().optional();
  },
});
export type ChatUpdate = zInfer<typeof ChatUpdate>;

export const ChatDelete = z.object({
  get chatId() {
    return ChatId;
  },
});
export type ChatDelete = zInfer<typeof ChatDelete>;

export const ChatRestore = z.object({
  get chatId() {
    return ChatId;
  },
});
export type ChatRestore = zInfer<typeof ChatRestore>;

export const ChatStart = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
  text: z.string(),
  get model() {
    return Model;
  },
  files: z.instanceof(File).array().optional(),
});
export type ChatStart = zInfer<typeof ChatStart>;

export const ChatStartOutput = z.object({
  get chat() {
    return ChatData;
  },
  get userMessage() {
    return MessageData;
  },
  get modelMessage() {
    return MessageData;
  },
});
export type ChatStartOutput = zInfer<typeof ChatStartOutput>;

export const ChatStartError = UserUsageLimitError;
export type ChatStartError = zInfer<typeof ChatStartError>;

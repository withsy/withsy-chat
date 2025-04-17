import { z } from "zod";
import { zParseDate, type zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";
import { UserId } from "./user";

export const ChatId = z.string().uuid();
export type ChatId = zInfer<typeof ChatId>;

export const ChatSchema = z.object({
  id: ChatId,
  title: z.string(),
  isStarred: z.boolean(),
  updatedAt: zParseDate(),
});
export type ChatSchema = zInfer<typeof ChatSchema>;

export const Chat = ChatSchema.extend({});
export type Chat = zInfer<typeof Chat>;

export const UpdateChat = z.object({
  chatId: ChatId,
  title: z.string().optional(),
  isStarred: z.boolean().optional(),
});
export type UpdateChat = zInfer<typeof UpdateChat>;

export const ChatRole = z.enum(["user", "model", "system"]);
export type ChatRole = zInfer<typeof ChatRole>;

export const ChatModel = z.enum(["gemini-2.0-flash", "gemini-1.5-pro"]);
export type ChatModel = zInfer<typeof ChatModel>;

export const ChatMessageId = z.number().int();
export type ChatMessageId = zInfer<typeof ChatMessageId>;

export const ChatMessageStatus = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
]);
export type ChatMessageStatus = zInfer<typeof ChatMessageStatus>;

export const ChatMessageSchema = z.object({
  id: ChatMessageId,
  chatId: ChatId,
  role: ChatRole,
  model: ChatModel.nullable(),
  text: z.string().nullable(),
  status: ChatMessageStatus,
  isBookmarked: z.boolean(),
  parentId: ChatMessageId.nullable(),
  createdAt: zParseDate(),
});
export type ChatMessageSchema = zInfer<typeof ChatMessageSchema>;

export const ChatMessage = ChatMessageSchema.extend({
  chat: Chat.nullable().default(null),
});
export type ChatMessage = zInfer<typeof ChatMessage>;

export const StartChat = z.object({
  idempotencyKey: IdempotencyKey,
  text: z.string(),
  model: ChatModel,
  files: z.array(z.instanceof(File)).optional(),
});
export type StartChat = zInfer<typeof StartChat>;

export const StartChatResult = z.object({
  chat: Chat,
  userChatMessage: ChatMessage,
  modelChatMessage: ChatMessage,
});
export type StartChatResult = zInfer<typeof StartChatResult>;

export const ListChatMessages = z.object({
  role: ChatRole.optional(),
  isBookmarked: z.boolean().optional(),
  options: z.object({
    scope: z.discriminatedUnion("by", [
      z.object({ by: z.literal("user"), userId: UserId }),
      z.object({ by: z.literal("chat"), chatId: ChatId }),
    ]),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
    limit: z.number().int().min(1).max(100).optional().default(20),
    afterId: ChatMessageId.optional(),
    include: z
      .object({
        chat: z.boolean().optional().default(false),
      })
      .optional(),
  }),
});
export type ListChatMessages = zInfer<typeof ListChatMessages>;

export const UpdateChatMessage = z.object({
  chatMessageId: ChatMessageId,
  isBookmarked: z.boolean().optional(),
});
export type UpdateChatMessage = zInfer<typeof UpdateChatMessage>;

export const SendChatMessage = z.object({
  idempotencyKey: IdempotencyKey,
  chatId: ChatId,
  text: z.string(),
  model: ChatModel,
  parentId: ChatMessageId.optional(),
  files: z.array(z.instanceof(File)).optional(),
});
export type SendChatMessage = zInfer<typeof SendChatMessage>;

export const SendChatMessageResult = z.object({
  userChatMessage: ChatMessage,
  modelChatMessage: ChatMessage,
});
export type SendChatMessageResult = zInfer<typeof SendChatMessageResult>;

export const ChatChunkIndex = z.number().int();
export type ChatChunkIndex = zInfer<typeof ChatChunkIndex>;

export const ReceiveChatChunkStream = z.object({
  chatMessageId: ChatMessageId,
  lastEventId: ChatChunkIndex.optional(),
});
export type ReceiveChatChunkStream = zInfer<typeof ReceiveChatChunkStream>;

export const ChatChunkSchema = z.object({
  chatMessageId: ChatMessageId,
  chunkIndex: ChatChunkIndex,
  text: z.string(),
});
export type ChatChunkSchema = zInfer<typeof ChatChunkSchema>;

export const ChatChunk = ChatChunkSchema.extend({});
export type ChatChunk = zInfer<typeof ChatChunk>;

export const ChatMessageFileId = z.number().int();
export type ChatMessageFileId = zInfer<typeof ChatMessageFileId>;

export const ChatMessageFileSchema = z.object({
  fileUri: z.string(),
  mimeType: z.string(),
});
export type ChatMessageFileSchema = zInfer<typeof ChatMessageFileSchema>;

export const ChatMessageFile = ChatMessageFileSchema.extend({});
export type ChatMessageFile = zInfer<typeof ChatMessageFile>;

import { z } from "zod";
import { IdempotencyKey, JsonValue, type zInfer, type zInput } from "./common";
import { UserId } from "./user";

export const ChatId = z.string().uuid();
export type ChatId = zInfer<typeof ChatId>;

export const Chat = z.object({
  id: ChatId,
  userId: UserId,
  title: z.string(),
  isStarred: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
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

export const ChatMessage = z.object({
  id: ChatMessageId,
  chatId: ChatId,
  role: ChatRole,
  model: ChatModel.nullable(),
  text: z.string().nullable(),
  status: ChatMessageStatus,
  isBookmarked: z.boolean(),
  parentId: ChatMessageId.nullable(),
  replyToId: ChatMessageId.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ChatMessage = zInfer<typeof ChatMessage>;

export const StartChat = z.object({
  idempotencyKey: IdempotencyKey,
  text: z.string(),
  model: ChatModel,
  files: z.array(z.instanceof(File)).optional(),
});
export type StartChat = zInfer<typeof StartChat>;

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
  }),
});
export type ListChatMessages = zInfer<typeof ListChatMessages>;
export type ListChatMessagesInput = zInput<typeof ListChatMessages>;

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

export const ChatChunkIndex = z.number().int();
export type ChatChunkIndex = zInfer<typeof ChatChunkIndex>;

export const ReceiveChatChunkStream = z.object({
  chatMessageId: ChatMessageId,
  lastEventId: ChatChunkIndex.optional(),
});
export type ReceiveChatChunkStream = zInfer<typeof ReceiveChatChunkStream>;

export const ChatChunk = z.object({
  chatMessageId: ChatMessageId,
  chunkIndex: ChatChunkIndex,
  text: z.string(),
  rawData: JsonValue,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ChatChunk = zInfer<typeof ChatChunk>;

export const ChatMessageFileId = z.number().int();
export type ChatMessageFileId = zInfer<typeof ChatMessageFileId>;

export const ChatMessageFile = z.object({
  id: ChatMessageFileId,
  chatMessageId: ChatMessageId,
  fileUri: z.string(),
  mimeType: z.string(),
});
export type ChatMessageFile = zInfer<typeof ChatMessageFile>;

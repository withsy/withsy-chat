import z from "zod";
import { createListSchemas, DateTimeTz } from "../common-schemas.js";
import { UserPromptId } from "../user-prompt/user-prompt-schemas.js";

export const ChatId = z.uuid();
export type ChatId = z.infer<typeof ChatId>;

export const ChatData = z.object({
  get id() {
    return ChatId;
  },
  title: z.string(),
  isStarred: z.boolean(),
  get userPromptId() {
    return UserPromptId.nullable();
  },
  get updatedAt() {
    return DateTimeTz;
  },
});
export type ChatData = z.infer<typeof ChatData>;

export const chatListSchemas = createListSchemas(ChatData);

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

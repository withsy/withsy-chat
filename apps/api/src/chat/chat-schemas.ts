import z from "zod";
import { createListSchemas, DateTimeTz } from "../common-schemas";

export const ChatId = z.uuid();
export type ChatId = z.infer<typeof ChatId>;

export const ChatData = z.object({
  get id() {
    return ChatId;
  },
  title: z.string(),
  isStarred: z.boolean(),
  type: z.string(),
  updatedAt: DateTimeTz,
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
});
export type ChatUpdate = z.infer<typeof ChatUpdate>;

export const ChatDelete = z.object({
  get chatId() {
    return ChatId;
  },
});
export type ChatDelete = z.infer<typeof ChatDelete>;

const chatListBranchSchemas = createListSchemas(ChatData);

export const ChatListBranch = chatListBranchSchemas.list.extend({
  get chatId() {
    return ChatId;
  },
});
export type ChatListBranch = z.infer<typeof ChatListBranch>;

export const ChatListBranchOutput = chatListBranchSchemas.listOutput;
export type ChatListBranchOutput = z.infer<typeof ChatListBranchOutput>;

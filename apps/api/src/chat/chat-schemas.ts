import z from "zod";
import { DateTimeTz } from "../common-schemas";

export const ChatId = z.uuid();
export type ChatId = z.infer<typeof ChatId>;

export const ChatData = z.object({
  get id() {
    return ChatId;
  },
  title: z.string(),
  isStarred: z.boolean(),
  updatedAt: DateTimeTz,
});
export type ChatData = z.infer<typeof ChatData>;

export const ChatList = z.object({
  limit: z.number().int().min(1).max(20).default(20),
  cursor: z.string().nullable().default(null),
});
export type ChatList = z.infer<typeof ChatList>;

export const ChatListOutput = z.object({
  get items() {
    return ChatData.array();
  },
  nextCursor: z.string().nullable().default(null),
});
export type ChatListOutput = z.infer<typeof ChatListOutput>;

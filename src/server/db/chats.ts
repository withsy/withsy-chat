import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const Chat = z.object({
  id: z.string(),
  title: z.string(),
  isStarred: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Chat = z.infer<typeof Chat>;

export const UpdateChat = z.object({
  chatId: z.string(),
  title: z.string().optional(),
  isStarred: z.boolean().optional(),
});
export type UpdateChat = z.infer<typeof UpdateChat>;

export class Chats {
  #data = new Map<string, Map<string, Chat>>();

  constructor() {
    const data = new Map<string, Chat>();
    this.#data.set("1", data);
    data.set("1", {
      id: "1",
      title: "Nyang-nyang-e",
      isStarred: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    data.set("2", {
      id: "2",
      title: "Kyak-kyak-e",
      isStarred: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  listChats(userId: string): Chat[] {
    const data = this.#data.get(userId);
    if (!data)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });

    const chats = Array.from(data.values());
    return chats;
  }

  updateChat(userId: string, input: UpdateChat): Chat {
    const data = this.#data.get(userId);
    if (!data)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });

    const { chatId, title, isStarred } = input;
    const chat = data.get(chatId);
    if (!chat)
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found." });

    let isUpdated = false;
    if (title !== undefined) {
      chat.title = title;
      isUpdated = true;
    }
    if (isStarred !== undefined) {
      chat.isStarred = isStarred;
      isUpdated = true;
    }
    if (isUpdated) {
      chat.updatedAt = new Date();
    }

    return chat;
  }
}

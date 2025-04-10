import type {
  Chat,
  ChatMessage,
  ListChatMessages,
  ReceiveChatMessage,
  SendChatMessage,
  StartChat,
  UpdateChat,
} from "@/types/chat";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "node:crypto";

export class Chats {
  #chats: Chat[] = [];
  #chatMessages: ChatMessage[] = [];

  constructor() {
    this.#chats.push(
      {
        id: randomUUID(),
        userId: "1",
        title: "Nyang-nyang-e",
        isStarred: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: "1",
        title: "Kyak-kyak-e",
        isStarred: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  }

  listChats(userId: string): Chat[] {
    return this.#chats.filter((v) => v.userId === userId);
  }

  updateChat(userId: string, input: UpdateChat): Chat {
    const { chatId, title, isStarred } = input;
    const chat = this.#chats.find(
      (v) => v.userId === userId && v.id === chatId
    );
    if (!chat)
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found." });

    let isUpdated = false;
    if (title != null) {
      chat.title = title;
      isUpdated = true;
    }
    if (isStarred != null) {
      chat.isStarred = isStarred;
      isUpdated = true;
    }
    if (isUpdated) chat.updatedAt = new Date();

    return chat;
  }

  startChat(userId: string, input: StartChat) {
    const { content, model } = input;
    const chat: Chat = {
      id: randomUUID(),
      createdAt: new Date(),
      userId,
      title: [...content].slice(0, 10).join(""),
      isStarred: false,
      updatedAt: new Date(),
    };
    this.#chats.push(chat);

    const chatMessage: ChatMessage = {
      id: randomUUID(),
      chatId: chat.id,
      isAi: false,
      content,
      model,
      parentId: null,
      usage: null,
      createdAt: new Date(),
    };
    this.#chatMessages.push(chatMessage);

    return {
      chat,
      chatMessage,
    };
  }

  sendMessage(input: SendChatMessage) {
    const { chatId, content, model } = input;
    const chat = this.#chats.find((v) => v.id === chatId);
    if (!chat)
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found." });

    const chatMessage: ChatMessage = {
      id: randomUUID(),
      content,
      createdAt: new Date(),
      chatId,
      isAi: false,
      model,
      parentId: null,
      usage: null,
    };
    this.#chatMessages.push(chatMessage);

    return chatMessage;
  }

  listMessages(input: ListChatMessages) {
    const { chatId } = input;
    return this.#chatMessages.filter((v) => v.chatId === chatId);
  }

  async *receiveChatMessage(input: ReceiveChatMessage) {
    const contents = [
      "Hello!\nHow can I help you today?\n",
      "I'm an AI assistant.",
      "Feel free to ask me anything.\nNyang.",
    ];

    for (const content of contents) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      yield { content };
    }
  }
}

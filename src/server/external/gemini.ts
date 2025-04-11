import { ChatId, ChatMessageId, type ChatModel } from "@/types/chat";
import { Chat, GoogleGenAI } from "@google/genai";
import { ee } from "../global";

export class Gemini {
  #ai: GoogleGenAI;

  // TODO: stateless or websocket based session.
  #chatMap = new Map<ChatId, Chat>();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Please set GEMINI_API_KEY env.");
    }
    this.#ai = new GoogleGenAI({ apiKey });
  }

  // TODO: refactor
  async sendChatMessage(
    chatId: ChatId,
    chatMessageId: ChatMessageId,
    model: ChatModel,
    text: string
  ) {
    let chat = this.#chatMap.get(chatId);
    if (!chat) {
      const newChat = this.#ai.chats.create({
        model,
        // TODO: fill history.
        history: [],
      });
      this.#chatMap.set(chatId, newChat);
      chat = newChat;
    }

    const stream = await chat.sendMessageStream({
      message: text,
    });
    try {
      for await (const data of stream) {
        ee.emit(`chatMessage:${chatMessageId}`, { kind: "data", data });
      }
    } catch (e) {
      ee.emit(`chatMessage:${chatMessageId}`, {
        kind: "error",
        error: e,
      });
    }
  }
}

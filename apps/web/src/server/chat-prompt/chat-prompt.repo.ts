import type { ChatId } from "@/types/chat";
import type { Tx } from "../db/db";

export class ChatPromptRepo {
  constructor(private readonly tx: Tx) {}

  async createChatPrompt(input: { chatId: ChatId; textEncrypted: string }) {
    const { chatId, textEncrypted } = input;

    return await this.tx.chatPrompt.create({
      data: {
        chatId,
        textEncrypted,
      },
    });
  }
}

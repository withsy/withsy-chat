import type { ChatId } from "@/types/chat";
import { ChatPromptSelect } from "@/types/chat-prompt";
import type { Tx } from "./db";

export class ChatPromptService {
  static async create(
    tx: Tx,
    input: { chatId: ChatId; textEncrypted: string }
  ) {
    const { chatId, textEncrypted } = input;

    const entity = await tx.chatPrompt.create({
      data: { chatId, textEncrypted },
      select: ChatPromptSelect,
    });

    return entity;
  }
}

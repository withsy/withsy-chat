import { ChatPromptSelect } from "@/types/chat-prompt";
import type { ChatId } from "@/types/id";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class ChatPromptService {
  constructor(private readonly service: ServiceRegistry) {}

  static async create(tx: Tx, input: { chatId: ChatId; text: string }) {
    const { chatId, text } = input;
    const res = await tx.chatPrompt.create({
      data: {
        chatId,
        text,
      },
      select: ChatPromptSelect,
    });

    return res;
  }
}

import * as ChatPrompt from "@/types/chat-prompt";
import type { ChatId } from "@/types/id";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class ChatPromptService {
  constructor(private readonly service: ServiceRegistry) {}

  static async create(
    tx: Tx,
    input: { chatId: ChatId; textEncrypted: string }
  ) {
    const { chatId, textEncrypted } = input;

    const entity = await tx.chatPrompt.create({
      data: { chatId, textEncrypted },
      select: ChatPrompt.Select,
    });

    return entity;
  }
}

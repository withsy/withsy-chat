import type { ChatId } from "@/types/chat";
import { PromptSelect } from "@/types/prompt";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class PromptService {
  constructor(private readonly service: ServiceRegistry) {}

  static async create(tx: Tx, input: { chatId: ChatId; text: string }) {
    const { chatId, text } = input;
    const res = await tx.prompt.create({
      data: {
        chatId,
        text,
      },
      select: PromptSelect,
    });

    return res;
  }
}

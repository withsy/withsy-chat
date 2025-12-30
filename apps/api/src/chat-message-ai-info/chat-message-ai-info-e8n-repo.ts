import { v4 } from "uuid";
import { Tx } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";

export class ChatMessageAiInfoE8nRepo {
  constructor(
    private readonly tx: Tx,
    private readonly e8nService: E8nService,
  ) {}

  async create(input: {}) {
    const {} = input;

    return await this.tx.chatMessageAiInfo.create({
      data: {
        id: v4(),
        chatMessageId: "",
        model: "",
        reasoningTextEncrypted: "",
      },
    });
  }
}

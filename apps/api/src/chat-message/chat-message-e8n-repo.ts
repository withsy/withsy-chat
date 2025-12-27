import { v7 } from "uuid";
import { ChatId } from "../chat/chat-schemas.js";
import { Tx } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatMessageStatus } from "../generated/prisma/enums.js";
import { ChatMessageModel } from "../generated/prisma/models.js";
import { Role } from "../role-schemas.js";

export class ChatMessageE8nRepo {
  constructor(
    private readonly tx: Tx,
    private readonly e8nService: E8nService,
  ) {}

  async createForUser(input: {
    chatId: ChatId;
    textEncrypted: string;
  }): Promise<ChatMessageModel> {
    const { chatId, textEncrypted } = input;

    const entity = await this.tx.chatMessage.create({
      data: {
        id: v7(),
        chatId,
        role: Role.enum.user,
        textEncrypted,
        reasoningTextEncrypted: this.e8nService.encrypt(""),
        status: ChatMessageStatus.succeeded,
      },
    });

    return entity;
  }

  async createForModel(input: { chatId: ChatId }): Promise<ChatMessageModel> {
    const { chatId } = input;

    const entity = await this.tx.chatMessage.create({
      data: {
        id: v7(),
        chatId,
        role: Role.enum.model,
        textEncrypted: this.e8nService.encrypt(""),
        reasoningTextEncrypted: this.e8nService.encrypt(""),
      },
    });

    return entity;
  }
}

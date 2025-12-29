import { v7 } from "uuid";
import { Tx } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatModel } from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";

export class ChatE8nRepo {
  constructor(
    private readonly tx: Tx,
    private readonly e8nService: E8nService,
  ) {}

  async create(userId: UserId, input: { title: string }): Promise<ChatModel> {
    const { title } = input;

    const entity = await this.tx.chat.create({
      data: {
        id: v7(),
        userId,
        titleEncrypted: this.e8nService.encrypt(title),
      },
    });

    return entity;
  }
}

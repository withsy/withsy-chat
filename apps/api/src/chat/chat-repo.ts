import { Tx } from "../db/db-service";
import { ChatModel } from "../generated/prisma/models";
import { UserId } from "../user/user-schemas";
import { ChatList } from "./chat-schemas";

export class ChatRepo {
  constructor(private readonly tx: Tx) {}

  async list(userId: UserId, input: ChatList): Promise<ChatModel[]> {
    const { limit, cursor } = input;

    const entities = await this.tx.chat.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        id: "asc",
      },
      take: limit,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
    });

    return entities;
  }
}

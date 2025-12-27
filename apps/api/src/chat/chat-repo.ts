import { Tx } from "../db/db-service.js";
import { ChatModel } from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";
import { ChatDelete, ChatList, ChatUpdate } from "./chat-schemas.js";

export class ChatRepo {
  constructor(private readonly tx: Tx) {}

  async list(
    userId: UserId,
    input: ChatList,
  ): Promise<{ entities: ChatModel[]; nextCursor: ChatModel["id"] | null }> {
    const { limit, cursor } = input;

    const entities = await this.tx.chat.findMany({
      where: {
        user: {
          id: userId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      orderBy: {
        id: "desc",
      },
      take: limit + 1,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
    });

    let nextCursor: ChatModel["id"] | null = null;
    if (entities.length > limit) {
      nextCursor = entities.pop()?.id ?? null;
    }

    return { entities, nextCursor };
  }

  async update(userId: UserId, input: ChatUpdate): Promise<ChatModel> {
    throw new Error();
  }

  async delete(userId: UserId, input: ChatDelete): Promise<ChatModel> {
    throw new Error();
  }
}

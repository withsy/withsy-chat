import { Tx } from "../db/db-service.js";
import { ChatModel } from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";
import { ChatDelete, ChatId, ChatList, ChatUpdate } from "./chat-schemas.js";

export class ChatRepo {
  constructor(private readonly tx: Tx) {}

  async list(
    userId: UserId,
    input: ChatList,
  ): Promise<{ entities: ChatModel[]; nextCursor: ChatModel["id"] | null }> {
    const { limit, cursor, direction } = input;

    const entities = await this.tx.chat.findMany({
      where: {
        deletedAt: null,
        userId,
        user: {
          deletedAt: null,
        },
      },
      orderBy: {
        id: direction === "forward" ? "desc" : "asc",
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

  async get(userId: UserId, input: { chatId: ChatId }): Promise<ChatModel> {
    const { chatId } = input;

    return await this.tx.chat.findUniqueOrThrow({
      where: {
        id: chatId,
        deletedAt: null,
        userId,
        user: {
          deletedAt: null,
        },
      },
    });
  }

  async update(userId: UserId, input: ChatUpdate): Promise<ChatModel> {
    throw new Error();
  }

  async delete(userId: UserId, input: ChatDelete): Promise<ChatModel> {
    throw new Error();
  }
}

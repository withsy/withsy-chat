import { Tx } from "../db/db-service.js";
import { ChatMessageModel } from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";
import { ChatMessageList } from "./chat-message-schemas.js";

export class ChatMessageRepo {
  constructor(private readonly tx: Tx) {}

  async list(
    userId: UserId,
    input: ChatMessageList,
  ): Promise<{
    entities: ChatMessageModel[];
    nextCursor: ChatMessageModel["id"] | null;
  }> {
    const { limit, cursor, direction, chatId } = input;

    const entities = await this.tx.chatMessage.findMany({
      where: {
        chat: {
          user: {
            id: userId,
            deletedAt: null,
          },
          id: chatId,
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

    let nextCursor: ChatMessageModel["id"] | null = null;
    if (entities.length > limit) {
      nextCursor = entities.pop()?.id ?? null;
    }

    return { entities, nextCursor };
  }
}

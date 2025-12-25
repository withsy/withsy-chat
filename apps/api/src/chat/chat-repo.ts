import { Tx } from "../db/db-service";
import { ChatModel } from "../generated/prisma/models";
import { UserId } from "../user/user-schemas";
import { ChatDelete, ChatList, ChatUpdate } from "./chat-schemas";

export class ChatRepo {
  constructor(private readonly tx: Tx) {}

  async list(userId: UserId, input: ChatList): Promise<ChatModel[]> {
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
      take: limit,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
    });

    return entities;
  }

  async update(userId: UserId, input: ChatUpdate): Promise<ChatModel> {
    throw new Error();
  }

  async delete(userId: UserId, input: ChatDelete): Promise<ChatModel> {
    throw new Error();
  }
}

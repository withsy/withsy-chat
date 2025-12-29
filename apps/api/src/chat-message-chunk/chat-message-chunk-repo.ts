import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { Tx } from "../db/db-service.js";
import { ChatMessageChunkModel } from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";
import { ChatMessageChunkIndex } from "./chat-message-chunk-entities.js";

type PartialChatMessageChunkModel = Pick<
  ChatMessageChunkModel,
  "index" | "textEncrypted" | "reasoningTextEncrypted" | "isDone"
>;

export class ChatMessageChunkRepo {
  constructor(private readonly tx: Tx) {}

  async list(
    userId: UserId,
    input: {
      chatMessageId: ChatMessageId;
      index?: ChatMessageChunkIndex;
      limit?: number;
    },
  ): Promise<PartialChatMessageChunkModel[]> {
    const { chatMessageId, index = 0, limit = 20 } = input;

    const entities = await this.tx.chatMessageChunk.findMany({
      where: {
        chatMessage: {
          id: chatMessageId,
          chat: {
            deletedAt: null,
            user: {
              id: userId,
              deletedAt: null,
            },
          },
        },
      },
      orderBy: {
        index: "asc",
      },
      cursor: {
        chatMessageId_index: {
          chatMessageId,
          index,
        },
      },
      take: limit,
      select: {
        index: true,
        textEncrypted: true,
        reasoningTextEncrypted: true,
        isDone: true,
      },
    });

    return entities;
  }
}

import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { ChatId } from "../chat/chat-schemas.js";
import { AiSendTextOutput } from "../common-schemas.js";
import { Tx } from "../db/db-service.js";
import { ChatChunkModel } from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";
import { ChatChunkIndex } from "./chat-chunk-entities.js";

type PartialChatChunkModel = Pick<
  ChatChunkModel,
  "index" | "textEncrypted" | "reasoningTextEncrypted" | "isDone"
>;

export class ChatChunkRepo {
  constructor(private readonly tx: Tx) {}

  async list(
    userId: UserId,
    input: {
      chatId: ChatId;
      chatMessageId: ChatMessageId;
      index: ChatChunkIndex;
      limit?: number;
    },
  ): Promise<PartialChatChunkModel[]> {
    const { chatId, chatMessageId, index, limit = 20 } = input;

    const entities = await this.tx.chatChunk.findMany({
      where: {
        chatMessage: {
          id: chatMessageId,
          chatId,
          chat: {
            deletedAt: null,
            userId,
            user: {
              deletedAt: null,
            },
          },
        },
      },
      orderBy: {
        index: "asc",
      },
      take: limit,
      cursor: {
        chatMessageId_index: {
          chatMessageId,
          index,
        },
      },
      select: {
        index: true,
        textEncrypted: true,
        reasoningTextEncrypted: true,
        isDone: true,
      },
    });

    return entities;
  }

  async create(
    context: { userId: UserId; chatId: ChatId; chatMessageId: ChatMessageId },
    input: AiSendTextOutput,
  ): Promise<void> {
    const {} = context;
    const {} = input;
  }
}

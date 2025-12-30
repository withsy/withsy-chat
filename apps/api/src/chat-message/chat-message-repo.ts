import { ChatId } from "../chat/chat-schemas.js";
import { Tx } from "../db/db-service.js";
import { isNotFoundForAnUpdate } from "../error.js";
import {
  ChatMessageModel,
  ChatModel,
  UserPromptModel,
} from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";
import {
  ChatMessageId,
  ChatMessageList,
  ChatMessageStatus,
} from "./chat-message-schemas.js";

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
          id: chatId,
          deletedAt: null,
          userId,
          user: {
            deletedAt: null,
          },
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

    return {
      entities,
      nextCursor,
    };
  }

  async get(
    userId: UserId,
    input: {
      chatId: ChatId;
      chatMessageId: ChatMessageId;
    },
  ): Promise<ChatMessageModel> {
    const { chatId, chatMessageId } = input;

    return await this.tx.chatMessage.findUniqueOrThrow({
      where: {
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
    });
  }

  async tryTransitionStatus(
    userId: UserId,
    input: {
      chatId: ChatId;
      chatMessageId: ChatMessageId;
      expectedStatus: ChatMessageStatus;
      nextStatus: ChatMessageStatus;
    },
    options?: { withChatPrompt?: boolean },
  ): Promise<
    | (ChatMessageModel & {
        chat?: ChatModel & {
          userPrompt?: UserPromptModel;
        };
      })
    | null
  > {
    const { chatId, chatMessageId, expectedStatus, nextStatus } = input;
    const { withChatPrompt = false } = options ?? {};

    try {
      const entity = await this.tx.chatMessage.update({
        where: {
          id: chatMessageId,
          status: expectedStatus,
          chat: {
            id: chatId,
            deletedAt: null,
            userId,
            user: {
              deletedAt: null,
            },
            OR: [
              {
                userPromptId: null,
              },
              {
                userPrompt: {
                  deletedAt: null,
                },
              },
            ],
          },
        },
        data: {
          status: nextStatus,
        },
        include: withChatPrompt
          ? {
              chat: {
                include: {
                  userPrompt: true,
                },
              },
            }
          : undefined,
      });

      return entity;
    } catch (e) {
      if (isNotFoundForAnUpdate(e)) {
        return null;
      }

      throw e;
    }
  }
}

import { Model } from "@repo/common";
import { v7 } from "uuid";
import { ChatId } from "../chat/chat-schemas.js";
import { Role } from "../common-schemas.js";
import { Tx } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
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

  async createForUser(
    context: {
      e8nService: E8nService;
    },
    input: {
      chatId: ChatId;
      text: string;
    },
  ): Promise<ChatMessageModel> {
    const { e8nService } = context;
    const { chatId, text } = input;

    const entity = await this.tx.chatMessage.create({
      data: {
        id: v7(),
        chatId,
        role: Role.enum.user,
        textEncrypted: e8nService.encrypt(text),
        reasoningTextEncrypted: e8nService.encrypt(""),
        status: ChatMessageStatus.enum.succeeded,
      },
    });

    return entity;
  }

  async createForModel(
    context: {
      e8nService: E8nService;
    },
    input: {
      chatId: ChatId;
      model: Model;
    },
  ): Promise<ChatMessageModel> {
    const { e8nService } = context;
    const { chatId, model } = input;

    const entity = await this.tx.chatMessage.create({
      data: {
        id: v7(),
        chatId,
        role: Role.enum.model,
        model,
        textEncrypted: e8nService.encrypt(""),
        reasoningTextEncrypted: e8nService.encrypt(""),
      },
    });

    return entity;
  }

  async tryTransitionStatus(
    context: {
      e8nService: E8nService;
    },
    userId: UserId,
    input: {
      chatId: ChatId;
      chatMessageId: ChatMessageId;
      expectedStatus: ChatMessageStatus;
      nextStatus: ChatMessageStatus;
      text?: string;
      reasoningText?: string;
    },
    options?: {
      withChatPrompt?: boolean;
    },
  ): Promise<
    | (ChatMessageModel & {
        chat?: ChatModel & {
          userPrompt?: UserPromptModel;
        };
      })
    | null
  > {
    const { e8nService } = context;
    const {
      chatId,
      chatMessageId,
      expectedStatus,
      nextStatus,
      text,
      reasoningText,
    } = input;
    const { withChatPrompt = false } = options ?? {};

    try {
      const entity = await this.tx.chatMessage.update({
        where: {
          id: chatMessageId,
          status: expectedStatus,
          textEncrypted: text ? e8nService.encrypt(text) : undefined,
          reasoningTextEncrypted: reasoningText
            ? e8nService.encrypt(reasoningText)
            : undefined,
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

import { Model } from "@repo/common";
import { v7 } from "uuid";
import { ChatId } from "../chat/chat-schemas.js";
import { Role } from "../common-schemas.js";
import { Tx } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { isNotFoundForAnUpdate } from "../error.js";
import { ChatMessageStatus } from "../generated/prisma/enums.js";
import {
  ChatMessageModel,
  ChatModel,
  UserPromptModel,
} from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";
import { ChatMessageId } from "./chat-message-schemas.js";

export class ChatMessageE8nRepo {
  constructor(
    private readonly tx: Tx,
    private readonly e8nService: E8nService,
  ) {}

  async createForUser(input: {
    chatId: ChatId;
    text: string;
  }): Promise<ChatMessageModel> {
    const { chatId, text } = input;

    const entity = await this.tx.chatMessage.create({
      data: {
        id: v7(),
        chatId,
        role: Role.enum.user,
        textEncrypted: this.e8nService.encrypt(text),
        reasoningTextEncrypted: this.e8nService.encrypt(""),
        status: ChatMessageStatus.succeeded,
      },
    });

    return entity;
  }

  async createForModel(input: {
    chatId: ChatId;
    model: Model;
  }): Promise<ChatMessageModel> {
    const { chatId, model } = input;

    const entity = await this.tx.chatMessage.create({
      data: {
        id: v7(),
        chatId,
        role: Role.enum.model,
        model,
        textEncrypted: this.e8nService.encrypt(""),
        reasoningTextEncrypted: this.e8nService.encrypt(""),
      },
    });

    return entity;
  }

  async tryTransitionStatus(
    userId: UserId,
    input: {
      chatId: ChatId;
      chatMessageId: ChatMessageId;
      expectedStatus: ChatMessageStatus;
      nextStatus: ChatMessageStatus;
      text?: string;
      reasoningText?: string;
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
          textEncrypted: text ? this.e8nService.encrypt(text) : undefined,
          reasoningTextEncrypted: reasoningText
            ? this.e8nService.encrypt(reasoningText)
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

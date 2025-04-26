import { ChatId, ChatSelect } from "@/types/chat";
import type {
  Message,
  MessageForHistory,
  MessageList,
  MessageSend,
  MessageUpdate,
} from "@/types/message";
import { MessageSelect, MessageStatus, type MessageId } from "@/types/message";
import type { Model } from "@/types/model";
import { PromptSelect } from "@/types/prompt";
import { Role } from "@/types/role";
import type { UserId } from "@/types/user";
import { StatusCodes } from "http-status-codes";
import { uuidv7 } from "uuidv7";
import { envConfig } from "../env-config";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageChunkService } from "./message-chunk";
import { MessageFileService } from "./message-file";
import { UserUsageLimitService } from "./user-usage-limit";

// TODO: Change limit history length
const DEFAULT_REMAIN_LENGTH = 10;

export class MessageService {
  constructor(private readonly service: ServiceRegistry) {}

  static async get(tx: Tx, input: { userId: UserId; messageId: MessageId }) {
    const { userId, messageId } = input;
    const res = await tx.message.findUniqueOrThrow({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: messageId,
      },
      select: MessageSelect,
    });

    return res;
  }

  async list(userId: UserId, input: MessageList) {
    const { role, isBookmarked, options } = input;
    const { scope, afterId, order, limit, include } = options;
    const xs = this.service.db.message.findMany({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        chatId: scope.by === "chat" ? scope.chatId : undefined,
        role,
        isBookmarked,
        isPublic: true,
      },
      orderBy: {
        id: order,
      },
      select: {
        ...MessageSelect,
        chat: include?.chat
          ? {
              select: ChatSelect,
            }
          : false,
      },
      take: limit,
      ...(afterId && {
        cursor: {
          id: afterId,
        },
        skip: 1,
      }),
    });

    return xs;
  }

  async listForHistory(input: { userId: UserId; modelMessage: Message }) {
    const { userId, modelMessage } = input;

    const history = {
      _olds: [] as MessageForHistory[], // old to less old
      pushOlds(...xs: MessageForHistory[]) {
        if (envConfig.nodeEnv === "development") console.log("@ push olds", xs);
        this._olds.push(...xs);
      },
      _news: [] as MessageForHistory[], // new to less new
      pushNews(...xs: MessageForHistory[]) {
        if (envConfig.nodeEnv === "development") console.log("@ push news", xs);
        this._news.push(...xs);
      },
      remainLength() {
        return DEFAULT_REMAIN_LENGTH - (this._olds.length + this._news.length);
      },
      resolve() {
        this._news.reverse();
        const histories = [...this._olds, ...this._news];
        this._olds = [];
        this._news = [];
        if (envConfig.nodeEnv === "development")
          console.log("@ histories", histories);
        return histories;
      },
    };

    await this.service.db.$transaction(async (tx) => {
      const currentHistories = await tx.message.findMany({
        where: {
          chat: {
            userId,
            deletedAt: null,
          },
          chatId: modelMessage.chatId,
          status: "succeeded",
          id: {
            lte: modelMessage.id,
          },
        },
        select: {
          role: true,
          text: true,
        },
        take: history.remainLength(),
        orderBy: {
          id: "desc",
        },
      });
      history.pushNews(...currentHistories);

      if (history.remainLength() > 0) {
        const chat = await tx.chat.findUniqueOrThrow({
          where: {
            userId,
            deletedAt: null,
            id: modelMessage.chatId,
          },
          include: {
            parentMessage: true,
          },
        });
        const { parentMessage } = chat;
        if (parentMessage && parentMessage.status === "succeeded") {
          history.pushNews({
            role: parentMessage.role,
            text: parentMessage.text,
          });

          if (history.remainLength() > 0) {
            const parentHistories = await tx.message.findMany({
              where: {
                chat: {
                  userId,
                  deletedAt: null,
                },
                chatId: parentMessage.chatId,
                status: "succeeded",
                id: {
                  lt: parentMessage.id,
                },
              },
              select: {
                role: true,
                text: true,
              },
              orderBy: {
                id: "desc",
              },
              take: history.remainLength(),
            });
            history.pushNews(...parentHistories);
          }
        }
      }
    });

    return history.resolve();
  }

  async get(input: {
    userId: UserId;
    messageId: MessageId;
    include?: {
      chat?: boolean;
    };
  }) {
    const { userId, messageId, include } = input;
    const res = await this.service.db.message.findUnique({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: messageId,
      },
      select: {
        ...MessageSelect,
        chat: include?.chat
          ? {
              select: {
                ...ChatSelect,
                prompts: {
                  select: {
                    ...PromptSelect,
                    text: true,
                  },
                },
              },
            }
          : false,
      },
    });

    return res;
  }

  async update(userId: UserId, input: MessageUpdate) {
    const { messageId, isBookmarked } = input;
    const res = await this.service.db.message.update({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: messageId,
      },
      data: {
        isBookmarked,
      },
      select: MessageSelect,
    });

    return res;
  }

  async isStaleCompleted(input: { userId: UserId; messageId: MessageId }) {
    const { userId, messageId } = input;
    const res = await this.service.db.message.findUnique({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: messageId,
        updatedAt: {
          lt: new Date(Date.now() - 5 * 60_000), // 5 minutes
        },
        status: {
          in: ["succeeded", "failed"],
        },
      },
      select: {
        id: true,
      },
    });

    return !!res;
  }

  static async transit(
    tx: Tx,
    input: {
      userId: UserId;
      messageId: MessageId;
      expectStatus: MessageStatus;
      nextStatus: MessageStatus;
    }
  ) {
    const { userId, messageId, expectStatus, nextStatus } = input;
    const res = await tx.message.update({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: messageId,
        status: expectStatus,
      },
      data: {
        status: nextStatus,
      },
      select: {
        id: true,
      },
    });

    return res;
  }

  async transitPendingToProcessing(input: {
    userId: UserId;
    messageId: MessageId;
  }) {
    const { userId, messageId } = input;
    const res = await MessageService.transit(this.service.db, {
      userId,
      messageId,
      expectStatus: "pending",
      nextStatus: "processing",
    });

    return res;
  }

  async transitProcessingToSucceeded(input: {
    userId: UserId;
    messageId: MessageId;
  }) {
    const { userId, messageId } = input;
    await this.service.db.$transaction(async (tx) => {
      const res = await MessageService.transit(tx, {
        userId,
        messageId,
        expectStatus: "processing",
        nextStatus: "succeeded",
      });

      if (!res)
        throw new HttpServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          `Chat message transition failed.`,
          {
            extra: {
              messageId,
              expectStatus: "processing",
              nextStatus: "succeeded",
            },
          }
        );

      const { text } = await MessageChunkService.buildText(tx, {
        userId,
        messageId,
      });
      await tx.message.update({
        where: {
          chat: {
            userId,
            deletedAt: null,
          },
          id: messageId,
        },
        data: {
          text,
        },
      });
    });
  }

  static async tryTransitProcessingToFailed(
    tx: Tx,
    input: {
      userId: UserId;
      messageId: MessageId;
    }
  ) {
    const { userId, messageId } = input;
    const res = await MessageService.transit(tx, {
      userId,
      messageId,
      expectStatus: "processing",
      nextStatus: "failed",
    });
    if (!res)
      console.warn(
        `Chat message transition failed. messageId: ${messageId} status: processing to failed.`
      );
  }

  async onCleanupZombiesTask() {
    const res = await this.service.db.message.updateMany({
      where: {
        status: {
          in: ["pending", "processing"],
        },
        updatedAt: {
          lt: new Date(Date.now() - 10 * 60_000), // 10 minutes
        },
      },
      data: {
        status: "failed",
      },
    });
    if (res.count > 0)
      console.warn(`Marked ${res.count} zombie messages as failed.`);
  }

  async send(userId: UserId, input: MessageSend) {
    const { idempotencyKey, chatId, model, text } = input;
    const files = input.files ?? [];

    await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
      await UserUsageLimitService.lockAndCheck(tx, { userId });
    });

    const { fileInfos } = await this.service.s3.uploads(userId, { files });

    const { userMessage, modelMessage } = await this.service.db.$transaction(
      async (tx) => {
        const userMessage = await MessageService.createUserMessage(tx, {
          chatId,
          text,
          isPublic: true,
        });

        const modelMessage = await MessageService.createModelMessage(tx, {
          chatId,
          model,
          parentMessageId: userMessage.id,
        });

        await MessageFileService.createAll(tx, {
          messageId: userMessage.id,
          fileInfos,
        });

        return { userMessage, modelMessage };
      }
    );

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    await UserUsageLimitService.lockAndDecrease(this.service.db, { userId });

    return {
      userMessage,
      modelMessage,
    };
  }

  static async createUserMessage(
    tx: Tx,
    input: { chatId: ChatId; text: string; isPublic: boolean }
  ) {
    const { chatId, text, isPublic } = input;
    const res = await tx.message.create({
      data: {
        id: MessageService.generateId(),
        chatId,
        text,
        role: Role.enum.user,
        status: "succeeded",
        isPublic,
      },
    });

    return res;
  }

  static async createModelMessage(
    tx: Tx,
    input: { chatId: ChatId; model: Model; parentMessageId: MessageId }
  ) {
    const { chatId, model, parentMessageId } = input;
    const res = await tx.message.create({
      data: {
        id: MessageService.generateId(),
        chatId,
        role: Role.enum.model,
        model,
        status: "pending",
        parentMessageId,
        isPublic: true,
      },
    });

    return res;
  }

  static generateId() {
    return uuidv7();
  }
}

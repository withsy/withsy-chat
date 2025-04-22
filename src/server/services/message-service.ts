import { ChatId, ChatSelect } from "@/types/chat";
import type {
  MessageForHistory,
  MessageList,
  MessageSend,
  MessageUpdate,
} from "@/types/message";
import { MessageSelect, MessageStatus, type MessageId } from "@/types/message";
import { Role } from "@/types/role";
import type { UserId } from "@/types/user";
import { StatusCodes } from "http-status-codes";
import { uuidv7 } from "uuidv7";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import { MessageChunkService } from "./message-chunk-service";
import { MessageFileService } from "./message-file-service";
import type { FileInfo } from "./mock-s3-service";

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
          : undefined,
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

  async listForHistory(input: {
    userId: UserId;
    modelMessage: {
      id: MessageId;
      chatId: ChatId;
    };
  }) {
    const { userId, modelMessage } = input;

    // TODO: Change limit history length
    let remainLength = 10;
    const histories = await this.service.db.$transaction(async (tx) => {
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
        take: remainLength,
        orderBy: {
          id: "desc",
        },
      });

      const histories: MessageForHistory[] = [];
      histories.push(...currentHistories);

      remainLength -= currentHistories.length;
      if (remainLength > 0) {
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
          histories.push({
            role: parentMessage.role,
            text: parentMessage.text,
          });
          remainLength -= 1;

          if (remainLength > 0) {
            const parentHistories = await tx.message.findMany({
              where: {
                chat: {
                  userId,
                  deletedAt: null,
                },
                chatId: parentMessage.chatId,
                status: "succeeded",
                id: parentMessage.id,
              },
              select: {
                role: true,
                text: true,
              },
              orderBy: {
                id: "desc",
              },
              take: remainLength,
            });
            histories.push(...parentHistories);
          }
        }
      }

      return histories;
    });

    histories.reverse(); // to oldest
    return histories;
  }

  async get(input: { userId: UserId; messageId: MessageId }) {
    const { userId, messageId } = input;
    const res = await this.service.db.message.findUnique({
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

  async tryTransitProcessingToFailed(input: {
    userId: UserId;
    messageId: MessageId;
  }) {
    const { userId, messageId } = input;
    const res = await MessageService.transit(this.service.db, {
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

    await this.service.idempotencyInfo.checkDuplicateRequest(idempotencyKey);

    const { fileInfos } = await this.service.s3.uploads(userId, { files });

    const { userMessage, modelMessage } = await this.service.db.$transaction(
      async (tx) => {
        const res = await MessageService.createInfo(tx, {
          chatId,
          model,
          text,
          fileInfos,
        });
        return res;
      }
    );

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    return {
      userMessage,
      modelMessage,
    };
  }

  static async createInfo(
    tx: Tx,
    input: Omit<MessageSend, "idempotencyKey" | "files"> & {
      fileInfos: FileInfo[];
    }
  ) {
    const { chatId, text, model, fileInfos } = input;

    const userMessage = await tx.message.create({
      data: {
        id: MessageService.generateId(),
        chatId,
        text,
        role: Role.enum.user,
        status: "succeeded",
      },
    });

    const modelMessage = await tx.message.create({
      data: {
        id: MessageService.generateId(),
        chatId,
        role: Role.enum.model,
        model,
        status: "pending",
        parentMessageId: userMessage.id,
      },
    });

    await MessageFileService.createAll(tx, {
      messageId: userMessage.id,
      fileInfos,
    });

    return {
      userMessage,
      modelMessage,
    };
  }

  static generateId() {
    return uuidv7();
  }
}

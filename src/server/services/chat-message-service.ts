import {
  ChatId,
  ChatMessageId,
  ChatMessageStatus,
  ChatRole,
  SendChatMessage,
  UpdateChatMessage,
  type ChatMessageForHistory,
  type ListChatMessages,
} from "@/types/chat";
import type { UserId } from "@/types/user";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import { ChatChunkService } from "./chat-chunk-service";
import { ChatMessageFileService } from "./chat-message-file-service";
import type { Tx } from "./db";
import type { FileInfo } from "./mock-s3-service";

export class ChatMessageService {
  constructor(private readonly service: ServiceRegistry) {}

  static async find(
    tx: Tx,
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const res = await tx.chatMessages.findUniqueOrThrow({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: chatMessageId,
      },
    });

    return res;
  }

  async list(userId: UserId, input: ListChatMessages) {
    const { role, isBookmarked, options } = input;
    const { scope, afterId, order, limit, include } = options;
    const xs = this.service.db.chatMessages.findMany({
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
      include: {
        chat: include?.chat,
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

  async listForHistory(
    userId: UserId,
    input: {
      modelChatMessage: {
        id: ChatMessageId;
        chatId: ChatId;
      };
    }
  ) {
    const { modelChatMessage } = input;

    // TODO: Change limit history length
    let remainLength = 10;
    const histories = await this.service.db.$transaction(async (tx) => {
      const currentHistories = await tx.chatMessages.findMany({
        where: {
          chat: {
            userId,
            deletedAt: null,
          },
          chatId: modelChatMessage.chatId,
          status: "succeeded",
          id: {
            lte: modelChatMessage.id,
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

      const histories: ChatMessageForHistory[] = [];
      histories.push(...currentHistories);

      remainLength -= currentHistories.length;
      if (remainLength > 0) {
        const chat = await tx.chats.findUniqueOrThrow({
          where: {
            userId,
            deletedAt: null,
            id: modelChatMessage.chatId,
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
            const parentHistories = await tx.chatMessages.findMany({
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

  async find(userId: UserId, input: { chatMessageId: ChatMessageId }) {
    const { chatMessageId } = input;
    const res = await this.service.db.chatMessages.findUnique({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: chatMessageId,
      },
    });

    return res;
  }

  async update(userId: UserId, input: UpdateChatMessage) {
    const { chatMessageId, isBookmarked } = input;
    const res = await this.service.db.chatMessages.update({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: chatMessageId,
      },
      data: {
        isBookmarked,
      },
    });

    return res;
  }

  async isStaleCompleted(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const res = await this.service.db.chatMessages.findUnique({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: chatMessageId,
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
    userId: UserId,
    input: {
      chatMessageId: ChatMessageId;
      expectStatus: ChatMessageStatus;
      nextStatus: ChatMessageStatus;
    }
  ) {
    const { chatMessageId, expectStatus, nextStatus } = input;
    const res = await tx.chatMessages.update({
      where: {
        chat: {
          userId,
          deletedAt: null,
        },
        id: chatMessageId,
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

  async transitPendingToProcessing(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      const res = await ChatMessageService.transit(tx, userId, {
        chatMessageId,
        expectStatus: "pending",
        nextStatus: "processing",
      });
      return res;
    });

    return res;
  }

  async transitProcessingToSucceeded(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    await this.service.db.$transaction(async (tx) => {
      const res = await ChatMessageService.transit(tx, userId, {
        chatMessageId,
        expectStatus: "processing",
        nextStatus: "succeeded",
      });
      if (!res)
        throw new HttpServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          `Chat message transition failed. chatMessageId: ${chatMessageId} status: processing to succeeded.`
        );

      const { text } = await ChatChunkService.buildText(
        tx,
        userId,
        chatMessageId
      );
      await tx.chatMessages.update({
        where: {
          chat: {
            userId,
            deletedAt: null,
          },
          id: chatMessageId,
        },
        data: {
          text,
        },
      });
    });
  }

  async tryTransitProcessingToFailed(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      const res = await ChatMessageService.transit(tx, userId, {
        chatMessageId,
        expectStatus: "processing",
        nextStatus: "failed",
      });
      return res;
    });
    if (!res)
      console.warn(
        `Chat message transition failed. chatMessageId: ${chatMessageId} status: processing to failed.`
      );
  }

  async onCleanupZombiesTask() {
    const res = await this.service.db.chatMessages.updateMany({
      where: {
        status: "processing",
        updatedAt: {
          lt: new Date(Date.now() - 5 * 60_000), // 5 minutes
        },
      },
      data: {
        status: "failed",
      },
    });
    if (res.count > 0)
      console.warn(`Marked ${res.count} zombie chat messages as failed.`);
  }

  async send(userId: UserId, input: SendChatMessage) {
    const { idempotencyKey, chatId, model, text } = input;
    const files = input.files ?? [];

    await this.service.idempotencyInfo.checkDuplicateRequest(idempotencyKey);

    const { fileInfos } = await this.service.s3.uploads(userId, { files });

    const { userChatMessage, modelChatMessage } =
      await this.service.db.$transaction(async (tx) => {
        const res = await ChatMessageService.createInfo(tx, {
          chatId,
          model,
          text,
          fileInfos,
        });
        return res;
      });

    await this.service.task.add("chat_model_route_send_chat_to_ai", {
      userId,
      userChatMessageId: userChatMessage.id,
      modelChatMessageId: modelChatMessage.id,
    });

    return {
      userChatMessage,
      modelChatMessage,
    };
  }

  static async createInfo(
    tx: Tx,
    input: Omit<SendChatMessage, "idempotencyKey" | "files"> & {
      fileInfos: FileInfo[];
    }
  ) {
    const { chatId, text, model, fileInfos } = input;

    const userChatMessage = await tx.chatMessages.create({
      data: {
        chatId,
        text,
        role: ChatRole.enum.user,
        status: "succeeded",
      },
    });

    const modelChatMessage = await tx.chatMessages.create({
      data: {
        chatId,
        role: ChatRole.enum.model,
        model,
        status: "pending",
      },
    });

    await ChatMessageFileService.createAll(tx, {
      chatMessageId: userChatMessage.id,
      fileInfos,
    });

    return {
      userChatMessage,
      modelChatMessage,
    };
  }
}

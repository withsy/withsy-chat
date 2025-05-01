import { Chat, ChatPrompt, Message, UserPrompt } from "@/types";
import type { ChatId, MessageId } from "@/types/id";
import type { MessageForHistory } from "@/types/message";
import { Model } from "@/types/model";
import { Role } from "@/types/role";
import type { UserId } from "@/types/user";
import { uuidv7 } from "uuidv7";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageFileService } from "./message-file";
import { UserUsageLimitService } from "./user-usage-limit";

// TODO: Change limit history length
const DEFAULT_REMAIN_LENGTH = 10;

export class MessageService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(entity: Message.Entity & { chat?: Chat.Entity }): Message.Data {
    const text = this.service.encryption.decrypt(entity.textEncrypted);
    const data = {
      id: entity.id,
      chatId: entity.chatId,
      role: Role.parse(entity.role),
      model: Model.parse(entity.model),
      text,
      status: entity.status,
      isBookmarked: entity.isBookmarked,
      createdAt: entity.createdAt,
      parentMessageId: entity.parentMessageId,
      chat: entity.chat ? this.service.chat.decrypt(entity.chat) : null,
    } satisfies Message.Data;
    return data;
  }

  async list(userId: UserId, input: Message.List): Promise<Message.ListOutput> {
    const { role, isBookmarked, options } = input;
    const { scope, afterId, order, limit, include } = options;

    const entities = await this.service.db.message.findMany({
      where: {
        chat: { userId, deletedAt: null },
        chatId: scope.by === "chat" ? scope.chatId : undefined,
        role,
        isBookmarked,
        isPublic: true,
      },
      orderBy: { id: order },
      select: {
        ...Message.Select,
        chat: include?.chat
          ? {
              select: Chat.Select,
            }
          : false,
      },
      take: limit,
      ...(afterId && {
        cursor: { id: afterId },
        skip: 1,
      }),
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  async listForHistory(input: {
    userId: UserId;
    modelMessage: Message.Entity;
  }) {
    const { userId, modelMessage } = input;

    const service = this.service;
    const history = {
      _olds: [] as MessageForHistory[], // old to less old
      pushOlds(...xs: MessageForHistory[]) {
        this._olds.push(...xs);
      },
      _news: [] as MessageForHistory[], // new to less new
      pushNews(...xs: MessageForHistory[]) {
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
        if (service.env.nodeEnv === "development")
          console.log("@ histories", histories);
        return histories;
      },
    };

    await this.service.db.$transaction(async (tx) => {
      const currentHistories = await tx.message.findMany({
        where: {
          chat: { userId, deletedAt: null },
          chatId: modelMessage.chatId,
          status: "succeeded",
          id: { lte: modelMessage.id },
        },
        select: { role: true, textEncrypted: true },
        take: history.remainLength(),
        orderBy: { id: "desc" },
      });
      history.pushNews(...currentHistories);

      if (history.remainLength() > 0) {
        const chat = await tx.chat.findUniqueOrThrow({
          where: {
            userId,
            deletedAt: null,
            id: modelMessage.chatId,
          },
          select: { parentMessage: { select: Message.Select } },
        });
        const { parentMessage } = chat;
        if (parentMessage && parentMessage.status === "succeeded") {
          history.pushNews({
            role: parentMessage.role,
            textEncrypted: parentMessage.textEncrypted,
          });

          if (history.remainLength() > 0) {
            const parentHistories = await tx.message.findMany({
              where: {
                chat: { userId, deletedAt: null },
                chatId: parentMessage.chatId,
                status: "succeeded",
                id: { lt: parentMessage.id },
              },
              select: { role: true, textEncrypted: true },
              orderBy: { id: "desc" },
              take: history.remainLength(),
            });
            history.pushNews(...parentHistories);
          }
        }
      }
    });

    return history.resolve();
  }

  async getForAi(input: {
    userId: UserId;
    messageId: MessageId;
    include?: {
      chat?: boolean;
    };
  }) {
    const { userId, messageId, include } = input;
    const entity = await this.service.db.message.findUnique({
      where: {
        chat: { userId, deletedAt: null },
        id: messageId,
      },
      select: {
        ...Message.Select,
        chat: include?.chat
          ? {
              select: {
                ...Chat.Select,
                prompts: { select: ChatPrompt.Select },
                userPrompt: { select: UserPrompt.Select },
              },
            }
          : false,
      },
    });

    return entity;
  }

  async update(userId: UserId, input: Message.Update): Promise<Message.Data> {
    const { messageId, isBookmarked } = input;

    const entity = await this.service.db.message.update({
      where: {
        chat: { userId, deletedAt: null },
        id: messageId,
      },
      data: { isBookmarked },
      select: Message.Select,
    });

    const data = this.decrypt(entity);
    return data;
  }

  async isStaleCompleted(input: {
    userId: UserId;
    messageId: MessageId;
  }): Promise<boolean> {
    const { userId, messageId } = input;

    const entity = await this.service.db.message.findUnique({
      where: {
        chat: { userId, deletedAt: null },
        id: messageId,
        updatedAt: {
          lt: new Date(Date.now() - 5 * 60_000), // 5 minutes
        },
        status: { in: ["succeeded", "failed"] },
      },
      select: { id: true },
    });

    return entity != null;
  }

  static async get(tx: Tx, input: { userId: UserId; messageId: MessageId }) {
    const { userId, messageId } = input;

    const entity = await tx.message.findUniqueOrThrow({
      where: {
        chat: { userId, deletedAt: null },
        id: messageId,
      },
      select: Message.Select,
    });

    return entity;
  }

  static async transit(
    tx: Tx,
    input: {
      userId: UserId;
      messageId: MessageId;
      expectStatus: Message.Status;
      nextStatus: Message.Status;
    }
  ) {
    const { userId, messageId, expectStatus, nextStatus } = input;

    const entity = await tx.message.update({
      where: {
        chat: { userId, deletedAt: null },
        id: messageId,
        status: expectStatus,
      },
      data: { status: nextStatus },
      select: { id: true },
    });

    return entity;
  }

  async transitPendingToProcessing(input: {
    userId: UserId;
    messageId: MessageId;
  }) {
    const { userId, messageId } = input;

    const entity = await MessageService.transit(this.service.db, {
      userId,
      messageId,
      expectStatus: "pending",
      nextStatus: "processing",
    });

    return entity;
  }

  async transitProcessingToSucceeded(input: {
    userId: UserId;
    messageId: MessageId;
  }) {
    const { userId, messageId } = input;

    const text = await this.service.messageChunk.buildText({
      userId,
      messageId,
    });
    const textEncrypted = this.service.encryption.encrypt(text);

    await this.service.db.$transaction(async (tx) => {
      await MessageService.transit(tx, {
        userId,
        messageId,
        expectStatus: "processing",
        nextStatus: "succeeded",
      });

      await tx.message.update({
        where: {
          chat: { userId, deletedAt: null },
          id: messageId,
        },
        data: { textEncrypted },
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
    try {
      await MessageService.transit(tx, {
        userId,
        messageId,
        expectStatus: "processing",
        nextStatus: "failed",
      });
    } catch (e) {
      console.warn(
        `Chat message transition failed. messageId: ${messageId} status: processing to failed. error:`,
        e
      );
    }
  }

  async onCleanupZombiesTask() {
    const res = await this.service.db.message.updateMany({
      where: {
        status: { in: ["pending", "processing"] },
        updatedAt: {
          lt: new Date(Date.now() - 10 * 60_000), // 10 minutes
        },
      },
      data: { status: "failed" },
    });

    if (res.count > 0)
      console.warn(`Marked ${res.count} zombie messages as failed.`);
  }

  async send(userId: UserId, input: Message.Send) {
    const { idempotencyKey, chatId, model, text } = input;
    const files = input.files ?? [];

    await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
      await UserUsageLimitService.lockAndCheck(tx, { userId });
    });

    const { fileInfos } = await this.service.s3.uploads(userId, { files });
    const textEncrypted = this.service.encryption.encrypt(text);

    const { userMessage, modelMessage } = await this.service.db.$transaction(
      async (tx) => {
        const userMessage = await MessageService.createUserMessage(tx, {
          chatId,
          textEncrypted,
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
    input: { chatId: ChatId; textEncrypted: string; isPublic: boolean }
  ) {
    const { chatId, textEncrypted, isPublic } = input;

    const entity = await tx.message.create({
      data: {
        id: MessageService.generateId(),
        chatId,
        textEncrypted,
        role: Role.enum.user,
        status: "succeeded",
        isPublic,
      },
    });

    return entity;
  }

  static async createModelMessage(
    tx: Tx,
    input: { chatId: ChatId; model: Model; parentMessageId: MessageId }
  ) {
    const { chatId, model, parentMessageId } = input;

    const entity = await tx.message.create({
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

    return entity;
  }

  static generateId() {
    return uuidv7();
  }
}

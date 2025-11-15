import { ChatEntity, ChatSelect } from "@/types/chat";
import { ChatPromptSelect } from "@/types/chat-prompt";
import type { ChatId, MessageId, UserId } from "@/types/id";
import {
  MessageData,
  MessageEntity,
  MessageGet,
  MessageGetOutput,
  MessageList,
  MessageListOutput,
  MessageSelect,
  MessageUpdate,
  type MessageEntityForAi,
  type MessageSend,
  type MessageSendOutput,
  type MessageStatus,
} from "@/types/message";
import { Model } from "@/types/model";
import { Role } from "@/types/role";
import { UserPromptSelect } from "@/types/user-prompt";
import { v7 as uuidv7 } from "uuid";
import type { Db, Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { UserUsageLimitService } from "./user-usage-limit";
import type { EncryptionService } from "./encryption";
import type { MessageChunkService } from "./message-chunk";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";
import type { TaskAdder } from "./task-adder";

// TODO: Change limit history length
const DEFAULT_REMAIN_LENGTH = 10;

export class MessageService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly chatMessageDecryptService: ChatMessageDecryptService,
    private readonly db: Db,
    private readonly messageChunkService: MessageChunkService,
    private readonly taskAdder: TaskAdder
  ) {}

  async get(userId: UserId, input: MessageGet): Promise<MessageGetOutput> {
    const { messageId } = input;
    const entity = await this.db.message.findUnique({
      where: { chat: { userId, deletedAt: null }, id: messageId },
      select: MessageSelect,
    });

    const data = entity
      ? this.chatMessageDecryptService.decryptMessage(entity)
      : null;
    return data;
  }

  async list(userId: UserId, input: MessageList): Promise<MessageListOutput> {
    const { role, isBookmarked, options } = input;
    const { scope, afterId, order, limit, include } = options;

    const entities = await this.db.message.findMany({
      where: {
        chat: { userId, deletedAt: null },
        chatId: scope.by === "chat" ? scope.chatId : undefined,
        role,
        isBookmarked,
        isPublic: true,
      },
      orderBy: { id: order },
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
        cursor: { id: afterId },
        skip: 1,
      }),
    });

    const datas = entities.map((x) =>
      this.chatMessageDecryptService.decryptMessage(x)
    );
    return datas;
  }

  async listForAi(input: {
    userId: UserId;
    modelMessage: MessageData;
  }): Promise<MessageEntityForAi[]> {
    const { userId, modelMessage } = input;

    const history = {
      _olds: [] as MessageEntityForAi[], // old to less old
      pushOlds(...xs: MessageEntityForAi[]) {
        this._olds.push(...xs);
      },
      _news: [] as MessageEntityForAi[], // new to less new
      pushNews(...xs: MessageEntityForAi[]) {
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
        return histories;
      },
    };

    await this.db.$transaction(async (tx) => {
      if (!modelMessage.parentMessageId)
        throw new Error("parentMessageId must exist.");

      const currentHistories = await tx.message.findMany({
        where: {
          chat: { userId, deletedAt: null },
          chatId: modelMessage.chatId,
          status: "succeeded",
          id: { lte: modelMessage.parentMessageId },
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
          select: { parentMessage: { select: MessageSelect } },
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

    const entity = await this.db.message.findUniqueOrThrow({
      where: { chat: { userId, deletedAt: null }, id: messageId },
      select: {
        ...MessageSelect,
        chat: include?.chat
          ? {
              select: {
                ...ChatSelect,
                prompts: { select: ChatPromptSelect },
                userPrompt: { select: UserPromptSelect },
              },
            }
          : false,
      },
    });

    return entity;
  }

  async update(userId: UserId, input: MessageUpdate): Promise<MessageData> {
    const { messageId, isBookmarked } = input;

    const entity = await this.db.message.update({
      where: {
        chat: { userId, deletedAt: null },
        id: messageId,
      },
      data: { isBookmarked },
      select: MessageSelect,
    });

    const data = this.chatMessageDecryptService.decryptMessage(entity);
    return data;
  }

  async isStaleCompleted(input: {
    userId: UserId;
    messageId: MessageId;
  }): Promise<boolean> {
    const { userId, messageId } = input;

    const entity = await this.db.message.findUnique({
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
      select: MessageSelect,
    });

    return entity;
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

    const entity = await MessageService.transit(this.db, {
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

    const { text, reasoningText } = await this.messageChunkService.buildText({
      userId,
      messageId,
    });
    const textEncrypted = this.encryptionService.encrypt(text);
    const reasoningTextEncrypted =
      this.encryptionService.encrypt(reasoningText);

    await this.db.$transaction(async (tx) => {
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
        data: { textEncrypted, reasoningTextEncrypted },
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
    const res = await this.db.message.updateMany({
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

  static async createUserMessage(
    tx: Tx,
    input: {
      chatId: ChatId;
      textEncrypted: string;
      isPublic: boolean;
      reasoningTextEncrypted: string;
    }
  ) {
    const { chatId, textEncrypted, isPublic, reasoningTextEncrypted } = input;

    const entity = await tx.message.create({
      data: {
        id: MessageService.generateId(),
        chatId,
        textEncrypted,
        reasoningTextEncrypted,
        role: Role.enum.user,
        status: "succeeded",
        isPublic,
      },
    });

    return entity;
  }

  static async createModelMessage(
    tx: Tx,
    input: {
      chatId: ChatId;
      model: Model;
      parentMessageId: MessageId;
      textEncrypted: string;
      reasoningTextEncrypted: string;
    }
  ) {
    const {
      chatId,
      model,
      parentMessageId,
      textEncrypted,
      reasoningTextEncrypted,
    } = input;

    const entity = await tx.message.create({
      data: {
        id: MessageService.generateId(),
        chatId,
        role: Role.enum.model,
        model,
        status: "pending",
        parentMessageId,
        isPublic: true,
        textEncrypted,
        reasoningTextEncrypted,
      },
    });

    return entity;
  }

  static generateId() {
    return uuidv7();
  }
}

import {
  ChatDelete,
  ChatGet,
  ChatSelect,
  ChatStart,
  ChatUpdate,
} from "@/types/chat";
import { UserId } from "@/types/user";
import { uuidv7 } from "uuidv7";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info-service";
import { MessageService } from "./message-service";
import { UserUsageLimitService } from "./user-usage-limit-service";

export class ChatService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId) {
    const xs = await this.service.db.chat.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: ChatSelect,
    });

    return xs;
  }

  async get(userId: UserId, input: ChatGet) {
    const { chatId, options } = input;
    const { include } = options ?? {};
    const res = await this.service.db.chat.findUnique({
      where: {
        id: chatId,
        userId,
        deletedAt: null,
      },
      select: {
        ...ChatSelect,
        parentMessage: include?.parentMessage ?? false,
      },
    });

    return res;
  }

  async update(userId: UserId, input: ChatUpdate) {
    const { chatId, title, isStarred } = input;
    const res = await this.service.db.chat.update({
      where: {
        id: chatId,
        userId,
        deletedAt: null,
      },
      data: {
        title,
        isStarred,
      },
      select: ChatSelect,
    });

    return res;
  }

  async delete(userId: UserId, input: ChatDelete) {
    const { chatId } = input;
    const res = await this.service.db.chat.update({
      where: {
        id: chatId,
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
      select: ChatSelect,
    });

    return res;
  }

  async start(userId: UserId, input: ChatStart) {
    const { model, text, idempotencyKey } = input;
    const files = input.files ?? [];

    await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
      await UserUsageLimitService.lockAndCheck(tx, { userId });
    });

    const { fileInfos } = await this.service.s3.uploads(userId, { files });

    const { chat, userMessage, modelMessage } =
      await this.service.db.$transaction(async (tx) => {
        const chat = await ChatService.create(tx, { userId, text });
        const { userMessage, modelMessage } = await MessageService.createInfo(
          tx,
          {
            chatId: chat.id,
            model,
            text,
            fileInfos,
          }
        );

        return { chat, userMessage, modelMessage };
      });

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    await UserUsageLimitService.lockAndDecrease(this.service.db, { userId });

    return {
      chat,
      userMessage,
      modelMessage,
    };
  }

  static async create(tx: Tx, input: { userId: UserId; text: string }) {
    const { userId, text } = input;
    const title = text ? [...text].slice(0, 20).join("") : undefined;
    const res = await tx.chat.create({
      data: {
        id: ChatService.generateId(),
        userId,
        title,
        type: "chat",
      },
    });

    return res;
  }

  static generateId() {
    return uuidv7();
  }
}

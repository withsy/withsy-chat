import { GratitudeJournal } from "@/types";
import {
  ChatDelete,
  ChatGet,
  ChatSelect,
  ChatStart,
  ChatUpdate,
} from "@/types/chat";
import { ChatPromptSelect } from "@/types/chat-prompt";
import type { MessageId } from "@/types/id";
import { MessageSelect } from "@/types/message";
import { UserId } from "@/types/user";
import { uuidv7 } from "uuidv7";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { MessageFileService } from "./message-file";
import { UserUsageLimitService } from "./user-usage-limit";

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
    const { chatId } = input;
    const res = await this.service.db.chat.findUnique({
      where: {
        id: chatId,
        userId,
        deletedAt: null,
      },
      select: {
        ...ChatSelect,
        parentMessage: { select: MessageSelect },
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
        const title = [...text].slice(0, 20).join("");
        const chat = await ChatService.createChat(tx, { userId, title });

        const userMessage = await MessageService.createUserMessage(tx, {
          chatId: chat.id,
          text,
          isPublic: true,
        });

        const modelMessage = await MessageService.createModelMessage(tx, {
          chatId: chat.id,
          model,
          parentMessageId: userMessage.id,
        });

        await MessageFileService.createAll(tx, {
          messageId: userMessage.id,
          fileInfos,
        });

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

  static async createChat(tx: Tx, input: { userId: UserId; title: string }) {
    const { userId, title } = input;
    const res = await tx.chat.create({
      data: {
        id: ChatService.generateId(),
        userId,
        title,
        type: "chat",
      },
      select: ChatSelect,
    });

    return res;
  }

  static async createGratitudeJournalChat(
    tx: Tx,
    input: { userId: UserId; title: string }
  ) {
    const { userId, title } = input;
    const res = await tx.chat.create({
      data: {
        id: ChatService.generateId(),
        userId,
        title,
        type: "gratitudeJournal",
      },
      select: {
        ...ChatSelect,
        prompts: { select: ChatPromptSelect },
        gratitudeJournals: { select: GratitudeJournal.Select },
      },
    });

    return res;
  }

  static async createBranchChat(
    tx: Tx,
    input: { userId: UserId; parentMessageId: MessageId; title: string }
  ) {
    const { userId, parentMessageId, title } = input;
    const res = await tx.chat.create({
      data: {
        id: ChatService.generateId(),
        userId,
        title,
        type: "branch",
        parentMessageId,
      },
      select: ChatSelect,
    });

    return res;
  }

  static generateId() {
    return uuidv7();
  }
}

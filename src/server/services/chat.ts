import * as Chat from "@/types/chat";
import * as ChatPrompt from "@/types/chat-prompt";
import * as GratitudeJournal from "@/types/gratitude-journal";
import type { MessageId, UserId } from "@/types/id";
import * as Message from "@/types/message";
import type * as UserPrompt from "@/types/user-prompt";
import { v7 as uuidv7 } from "uuid";
import type { ServiceRegistry } from "../service-registry";
import { getHardDeleteCutoffDate } from "../utils";
import type { Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { UserUsageLimitService } from "./user-usage-limit";

export class ChatService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(
    entity: Chat.Entity & {
      parentMessage?: Message.Entity | null;
      userPrompt?: UserPrompt.Entity | null;
    }
  ): Chat.Data {
    const title = this.service.encryption.decrypt(entity.titleEncrypted);
    const data = {
      id: entity.id,
      title,
      isStarred: entity.isStarred,
      type: entity.type,
      parentMessageId: entity.parentMessageId,
      parentMessage: entity.parentMessage
        ? this.service.message.decrypt(entity.parentMessage)
        : null,
      updatedAt: entity.updatedAt,
      userPromptId: entity.userPromptId,
      userPrompt: entity.userPrompt
        ? this.service.userPrompt.decrypt(entity.userPrompt)
        : null,
    } satisfies Chat.Data;
    return data;
  }

  async list(userId: UserId): Promise<Chat.ListOutout> {
    const entities = await this.service.db.chat.findMany({
      where: { userId, deletedAt: null },
      orderBy: { id: "asc" },
      select: Chat.Select,
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  async listDeleted(userId: UserId): Promise<Chat.ListOutout> {
    const entities = await this.service.db.chat.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { id: "asc" },
      select: Chat.Select,
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  async get(userId: UserId, input: Chat.Get): Promise<Chat.Data> {
    const { chatId } = input;

    const entity = await this.service.db.chat.findUniqueOrThrow({
      where: { id: chatId, userId, deletedAt: null },
      select: {
        ...Chat.Select,
        parentMessage: { select: Message.Select },
      },
    });

    const data = this.decrypt(entity);
    return data;
  }

  async update(userId: UserId, input: Chat.Update): Promise<Chat.Data> {
    const { chatId, title, isStarred, userPromptId } = input;

    const titleEncrypted =
      title != null ? this.service.encryption.encrypt(title) : undefined;

    const entity = await this.service.db.$transaction(async (tx) => {
      if (userPromptId)
        await tx.userPrompt.findUniqueOrThrow({
          where: { userId, deletedAt: null, id: userPromptId },
        });

      const entity = await tx.chat.update({
        where: { id: chatId, userId, deletedAt: null },
        data: {
          titleEncrypted,
          isStarred,
          userPromptId,
        },
        select: Chat.Select,
      });

      return entity;
    });

    const data = this.decrypt(entity);
    return data;
  }

  async delete(userId: UserId, input: Chat.Delete): Promise<void> {
    const { chatId } = input;

    await this.service.db.chat.update({
      where: { id: chatId, userId, deletedAt: null },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  async restore(userId: UserId, input: Chat.Restore): Promise<Chat.Data> {
    const { chatId } = input;

    const entity = await this.service.db.chat.update({
      where: { id: chatId, userId, deletedAt: { not: null } },
      data: { deletedAt: null },
      select: Chat.Select,
    });

    const data = this.decrypt(entity);
    return data;
  }

  async start(userId: UserId, input: Chat.Start): Promise<Chat.StartOutput> {
    const { model, text, idempotencyKey } = input;

    await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
      await UserUsageLimitService.checkMessage(tx, { userId });
    });

    const modelMessageTextEncrypted = this.service.encryption.encrypt("");
    const modelMessageReasoningTextEncrypted =
      this.service.encryption.encrypt("");
    const userMessageTextEncrypted = this.service.encryption.encrypt(text);
    const userMessageReasoningTextEncrypted =
      this.service.encryption.encrypt("");
    const title = [...text].slice(0, 20).join("");
    const titleEncrypted = this.service.encryption.encrypt(title);

    const { chat, userMessage, modelMessage } =
      await this.service.db.$transaction(async (tx) => {
        const chat = await ChatService.createChat(tx, {
          userId,
          titleEncrypted,
        });

        const userMessage = await MessageService.createUserMessage(tx, {
          chatId: chat.id,
          textEncrypted: userMessageTextEncrypted,
          reasoningTextEncrypted: userMessageReasoningTextEncrypted,
          isPublic: true,
        });

        const modelMessage = await MessageService.createModelMessage(tx, {
          chatId: chat.id,
          model,
          parentMessageId: userMessage.id,
          textEncrypted: modelMessageTextEncrypted,
          reasoningTextEncrypted: modelMessageReasoningTextEncrypted,
        });

        return { chat, userMessage, modelMessage };
      });

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    await UserUsageLimitService.decreaseMessage(this.service.db, { userId });

    const res = {
      chat: this.decrypt(chat),
      userMessage: this.service.message.decrypt(userMessage),
      modelMessage: this.service.message.decrypt(modelMessage),
    } satisfies Chat.StartOutput;

    return res;
  }

  async onHardDeleteTask() {
    const cutoffDate = getHardDeleteCutoffDate(new Date());

    await this.service.db.$transaction(async (tx) => {
      const chatsToDelete = await tx.chat.findMany({
        where: { deletedAt: { not: null, lt: cutoffDate } },
        select: { id: true },
      });

      if (chatsToDelete.length === 0) return;

      const chatIds = chatsToDelete.map((x) => x.id);
      console.warn(
        `Preparing to delete ${chatIds.length}. chats: ${chatIds.join(", ")}`
      );

      const res = await tx.chat.deleteMany({
        where: { id: { in: chatIds } },
      });
      console.warn(`Successfully hard deleted ${res.count} chats.`);
    });
  }

  static async createChat(
    tx: Tx,
    input: { userId: UserId; titleEncrypted: string }
  ) {
    const { userId, titleEncrypted } = input;

    const entity = await tx.chat.create({
      data: {
        id: ChatService.generateId(),
        userId,
        titleEncrypted,
        type: "chat",
      },
      select: Chat.Select,
    });

    return entity;
  }

  static async createGratitudeJournalChat(
    tx: Tx,
    input: { userId: UserId; titleEncrypted: string }
  ) {
    const { userId, titleEncrypted } = input;

    const entity = await tx.chat.create({
      data: {
        id: ChatService.generateId(),
        userId,
        titleEncrypted,
        type: "gratitudeJournal",
      },
      select: {
        ...Chat.Select,
        prompts: { select: ChatPrompt.Select },
        gratitudeJournals: { select: GratitudeJournal.Select },
      },
    });

    return entity;
  }

  static async createBranchChat(
    tx: Tx,
    input: {
      userId: UserId;
      parentMessageId: MessageId;
      titleEncrypted: string;
    }
  ) {
    const { userId, parentMessageId, titleEncrypted } = input;

    const entity = await tx.chat.create({
      data: {
        id: ChatService.generateId(),
        userId,
        titleEncrypted,
        type: "branch",
        parentMessageId,
      },
      select: Chat.Select,
    });

    return entity;
  }

  static generateId() {
    return uuidv7();
  }
}

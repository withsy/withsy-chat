import {
  ChatData,
  ChatDelete,
  ChatEntity,
  ChatGet,
  ChatListOutout,
  ChatRestore,
  ChatSelect,
  ChatStart,
  ChatStartOutput,
  ChatUpdate,
} from "@/types/chat";
import { ChatPromptSelect } from "@/types/chat-prompt";
import { GratitudeJournalSelect } from "@/types/gratitude-journal";
import type { MessageId, UserId } from "@/types/id";
import { MessageSelect } from "@/types/message";
import { v7 as uuidv7 } from "uuid";
import type { Db, Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { UserUsageLimitService } from "./user-usage-limit";
import type { EncryptionService } from "./encryption";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";
import type { TaskAdder } from "./task-adder";

export class ChatService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db,
    private readonly chatMessageDecryptService: ChatMessageDecryptService,
    private readonly taskAdder: TaskAdder
  ) {}

  async list(userId: UserId): Promise<ChatListOutout> {
    const entities = await this.db.chat.findMany({
      where: { userId, deletedAt: null },
      orderBy: { id: "asc" },
      select: ChatSelect,
    });

    const datas = entities.map((x) =>
      this.chatMessageDecryptService.decryptChat(x)
    );
    return datas;
  }

  async listDeleted(userId: UserId): Promise<ChatListOutout> {
    const entities = await this.db.chat.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { id: "asc" },
      select: ChatSelect,
    });

    const datas = entities.map((x) =>
      this.chatMessageDecryptService.decryptChat(x)
    );
    return datas;
  }

  async get(userId: UserId, input: ChatGet): Promise<ChatData> {
    const { chatId } = input;

    const entity = await this.db.chat.findUniqueOrThrow({
      where: { id: chatId, userId, deletedAt: null },
      select: {
        ...ChatSelect,
        parentMessage: { select: MessageSelect },
      },
    });

    const data = this.chatMessageDecryptService.decryptChat(entity);
    return data;
  }

  async update(userId: UserId, input: ChatUpdate): Promise<ChatData> {
    const { chatId, title, isStarred, userPromptId } = input;

    const titleEncrypted =
      title != null ? this.encryptionService.encrypt(title) : undefined;

    const entity = await this.db.$transaction(async (tx) => {
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
        select: ChatSelect,
      });

      return entity;
    });

    const data = this.chatMessageDecryptService.decryptChat(entity);
    return data;
  }

  async delete(userId: UserId, input: ChatDelete): Promise<void> {
    const { chatId } = input;

    await this.db.chat.update({
      where: { id: chatId, userId, deletedAt: null },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  async restore(userId: UserId, input: ChatRestore): Promise<ChatData> {
    const { chatId } = input;

    const entity = await this.db.chat.update({
      where: { id: chatId, userId, deletedAt: { not: null } },
      data: { deletedAt: null },
      select: ChatSelect,
    });

    const data = this.chatMessageDecryptService.decryptChat(entity);
    return data;
  }

  async start(userId: UserId, input: ChatStart): Promise<ChatStartOutput> {
    const { model, text, idempotencyKey } = input;

    await this.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
      await UserUsageLimitService.checkMessage(tx, { userId });
    });

    const modelMessageTextEncrypted = this.encryptionService.encrypt("");
    const modelMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");
    const userMessageTextEncrypted = this.encryptionService.encrypt(text);
    const userMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");
    const title = [...text].slice(0, 20).join("");
    const titleEncrypted = this.encryptionService.encrypt(title);

    const { chat, userMessage, modelMessage } = await this.db.$transaction(
      async (tx) => {
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
      }
    );

    await this.taskAdder.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    await UserUsageLimitService.decreaseMessage(this.db, { userId });

    const res = {
      chat: this.chatMessageDecryptService.decryptChat(chat),
      userMessage: this.chatMessageDecryptService.decryptMessage(userMessage),
      modelMessage: this.chatMessageDecryptService.decryptMessage(modelMessage),
    } satisfies ChatStartOutput;

    return res;
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
      select: ChatSelect,
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
        ...ChatSelect,
        prompts: { select: ChatPromptSelect },
        gratitudeJournals: { select: GratitudeJournalSelect },
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
      select: ChatSelect,
    });

    return entity;
  }

  static generateId() {
    return uuidv7();
  }
}

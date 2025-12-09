import {
  ChatData,
  ChatDelete,
  ChatGet,
  ChatListOutout,
  ChatRestore,
  ChatSelect,
  ChatUpdate,
} from "@/types/chat";
import { ChatPromptSelect } from "@/types/chat-prompt";
import { GratitudeJournalSelect } from "@/types/gratitude-journal";
import { MessageId, MessageSelect } from "@/types/message";
import type { UserId } from "@/types/user";
import { v7 as uuidv7 } from "uuid";
import type { EncryptionService } from "../encryption/encryption.service";
import type { ChatMessageDecryptService } from "../services/chat-message-decrypt";
import type { Db, Tx } from "../services/db";
import { ChatRepository } from "./chat.repository";

export class ChatService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db,
    private readonly chatMessageDecryptService: ChatMessageDecryptService
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

    const titleEncrypted = title
      ? this.encryptionService.encrypt(title)
      : undefined;

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

  async hardDeleteChats() {
    await this.db.$transaction(async (tx) => {
      const chatRepository = new ChatRepository(tx);

      const chats = await chatRepository.findChatsToHardDelete();
      if (chats.length === 0) {
        return;
      }

      const chatIds = chats.map((x) => x.id);
      console.warn(
        `Preparing to delete ${chatIds.length}. chats: ${chatIds.join(", ")}`
      );

      const res = await chatRepository.hardDeleteChats(chatIds);
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

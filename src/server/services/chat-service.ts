import {
  Chat,
  ChatDelete,
  ChatListBranches,
  ChatMessage,
  ChatMessageId,
  ChatMessageSchema,
  ChatSchema,
  GetChat,
  StartBranchChat,
  type StartChat,
  type UpdateChat,
} from "@/types/chat";
import { cols } from "@/types/common";
import { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import { ChatMessageService } from "./chat-message-service";
import type { Db, Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info-service";

export class ChatService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId) {
    const xs = await this.service.db.chats.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return xs;
  }

  async listBranches(userId: UserId, input: ChatListBranches) {
    const { chatId } = input;
    const xs = this.service.db.chats.findMany({
      where: {
        parentMessage: {
          chatId,
        },
        userId,
        deletedAt: null,
      },
    });

    return xs;
  }

  async get(userId: UserId, input: GetChat) {
    const { chatId, options } = input;
    const { include } = options ?? {};
    const res = await this.service.db.chats.findUnique({
      where: {
        id: chatId,
        userId,
        deletedAt: null,
      },
      include: {
        parentMessage: include?.parentMessage ?? false,
      },
    });

    return res;
  }

  async update(userId: UserId, input: UpdateChat) {
    const { chatId, title, isStarred } = input;
    const res = await this.service.db.chats.update({
      where: {
        id: chatId,
        userId,
        deletedAt: null,
      },
      data: {
        title,
        isStarred,
      },
    });

    return res;
  }

  async delete(userId: UserId, input: ChatDelete) {
    const { chatId } = input;
    const res = await this.service.db.chats.update({
      where: {
        id: chatId,
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return res;
  }

  async start(userId: UserId, input: StartChat) {
    const { model, text, idempotencyKey } = input;
    const files = input.files ?? [];

    await this.service.idempotencyInfo.checkDuplicateRequest(idempotencyKey);

    const { fileInfos } = await this.service.s3.uploads(userId, { files });

    const { chat, userChatMessage, modelChatMessage } =
      await this.service.db.$transaction(async (tx) => {
        const chat = await ChatService.createChat(tx, { userId, text });
        const { userChatMessage, modelChatMessage } =
          await ChatMessageService.createInfo(tx, {
            chatId: chat.id,
            model,
            text,
            fileInfos,
          });

        return { chat, userChatMessage, modelChatMessage };
      });

    await this.service.task.add("chat_model_route_send_chat_to_ai", {
      userId,
      userChatMessageId: userChatMessage.id,
      modelChatMessageId: modelChatMessage.id,
    });

    return {
      chat,
      userChatMessage,
      modelChatMessage,
    };
  }

  async startBranch(userId: UserId, input: StartBranchChat) {
    const { idempotencyKey, parentMessageId } = input;

    const res = await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const parentMessage = await ChatMessageService.find(tx, userId, {
        chatMessageId: parentMessageId,
      });
      const title = parentMessage.text
        ? [...parentMessage.text].slice(0, 20).join("")
        : undefined;
      const chat = await ChatService.createBranchChat(tx, {
        userId,
        parentMessageId,
        title,
      });

      return chat;
    });

    return res;
  }

  static async createChat(tx: Tx, input: { userId: UserId; text: string }) {
    const { userId, text } = input;
    const title = text ? [...text].slice(0, 20).join("") : undefined;
    const res = await tx.chats.create({
      data: {
        userId,
        title,
        type: "chat",
      },
    });

    return res;
  }

  static async createBranchChat(
    tx: Tx,
    input: { userId: UserId; parentMessageId: ChatMessageId; title?: string }
  ) {
    const { userId, parentMessageId, title } = input;
    const res = await tx.chats.create({
      data: {
        userId,
        title,
        type: "branch",
        parentMessageId,
      },
    });

    return res;
  }
}

import {
  Chat,
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
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import { ChatMessageService } from "./chat-message-service";
import type { Db } from "./db";
import { IdempotencyInfoService } from "./idempotency-info-service";

export class ChatService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId) {
    const res = await this.service.db
      .selectFrom("chats as c")
      .where("c.userId", "=", userId)
      .orderBy("c.createdAt", "asc")
      .select(cols(ChatSchema, "c"))
      .execute();

    return res;
  }

  async get(userId: UserId, input: GetChat) {
    const { chatId, options } = input;
    const { include } = options ?? {};
    const res = await this.service.db.transaction().execute(async (tx) => {
      const chat = await tx
        .selectFrom("chats as c")
        .where("c.userId", "=", userId)
        .where("c.id", "=", chatId)
        .select(cols(ChatSchema, "c"))
        .executeTakeFirstOrThrow();

      const parsedChat = Chat.parse(chat);
      if (chat.parentMessageId && include?.parentMessage) {
        const parentMessage = await tx
          .selectFrom("chatMessages as cm")
          .innerJoin("chats as c", "c.id", "cm.chatId")
          .where("c.userId", "=", userId)
          .where("cm.id", "=", chat.parentMessageId)
          .select(cols(ChatMessageSchema, "cm"))
          .executeTakeFirstOrThrow();
        parsedChat.parentMessage = ChatMessage.parse(parentMessage);
      }

      return parsedChat;
    });

    return res;
  }

  async update(userId: UserId, input: UpdateChat) {
    const { chatId, title, isStarred } = input;
    const res = await this.service.db
      .updateTable("chats as c")
      .where("c.userId", "=", userId)
      .where("c.id", "=", chatId)
      .set({ title, isStarred })
      .returning(cols(ChatSchema, "c"))
      .executeTakeFirstOrThrow();

    return res;
  }

  async start(userId: UserId, input: StartChat) {
    const { model, text, idempotencyKey } = input;
    const files = input.files ?? [];

    await this.service.idempotencyInfo.checkDuplicateRequest(idempotencyKey);

    const { fileInfos } = await this.service.s3.uploads(userId, { files });

    const { chat, userChatMessage, modelChatMessage } = await this.service.db
      .transaction()
      .execute(async (tx) => {
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

    await this.service.task.add("google_gen_ai_send_chat", {
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

    const res = await this.service.db.transaction().execute(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const parentMessage = await ChatMessageService.get(tx, userId, {
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

  static async createChat(db: Db, input: { userId: UserId; text: string }) {
    const { userId, text } = input;
    const title = text ? [...text].slice(0, 20).join("") : undefined;
    const res = await db
      .insertInto("chats")
      .values({ userId, title, type: "chat" })
      .returning(cols(ChatSchema, "chats"))
      .executeTakeFirstOrThrow();

    return res;
  }

  static async createBranchChat(
    db: Db,
    input: { userId: UserId; parentMessageId: ChatMessageId; title?: string }
  ) {
    const { userId, parentMessageId, title } = input;
    const res = await db
      .insertInto("chats")
      .values({ userId, title, type: "branch", parentMessageId })
      .returning(cols(ChatSchema, "chats"))
      .executeTakeFirstOrThrow();

    return res;
  }
}

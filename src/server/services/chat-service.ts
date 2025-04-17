import {
  Chat,
  ChatMessage,
  type StartChat,
  type UpdateChat,
} from "@/types/chat";
import { checkExactKeys, checkExactKeysArray } from "@/types/common";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import { ChatMessageService } from "./chat-message-service";
import type { Db } from "./db";

export class ChatService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId) {
    const res = await this.service.db
      .selectFrom("chats as c")
      .where("c.userId", "=", userId)
      .orderBy("c.createdAt", "asc")
      .select(["c.id", "c.isStarred", "c.updatedAt", "c.title"])
      .execute();

    return checkExactKeysArray<Chat>()(res);
  }

  async update(userId: UserId, input: UpdateChat) {
    const { chatId, title, isStarred } = input;
    const res = await this.service.db
      .updateTable("chats as c")
      .where("c.userId", "=", userId)
      .where("c.id", "=", chatId)
      .set({ title, isStarred })
      .returning(["c.id", "c.isStarred", "c.updatedAt", "c.title"])
      .executeTakeFirstOrThrow();

    return checkExactKeys<Chat>()(res);
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
      chat: checkExactKeys<Chat>()(chat),
      userChatMessage: checkExactKeys<ChatMessage>()(userChatMessage),
      modelChatMessage: checkExactKeys<ChatMessage>()(modelChatMessage),
    };
  }

  static async createChat(db: Db, input: { userId: UserId; text: string }) {
    const { userId, text } = input;
    const title = [...text].slice(0, 10).join("");
    const res = await db
      .insertInto("chats")
      .values({ userId, title })
      .returning(["id", "updatedAt", "title", "isStarred"])
      .executeTakeFirstOrThrow();

    return checkExactKeys<Chat>()(res);
  }
}

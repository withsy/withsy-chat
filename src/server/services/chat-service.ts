import { type StartChat, type UpdateChat } from "@/types/chat";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import { ChatMessageService } from "./chat-message-service";
import type { Db } from "./db";

export class ChatService {
  constructor(private readonly s: ServiceRegistry) {}

  async list(userId: UserId) {
    const rows = await this.s.db
      .selectFrom("chats as c")
      .where("c.userId", "=", userId)
      .orderBy("c.createdAt", "asc")
      .select([])
      .execute();
    return rows;
  }

  async update(userId: UserId, input: UpdateChat) {
    const { chatId, title, isStarred } = input;
    const row = await this.s.db
      .updateTable("chats as c")
      .where("c.userId", "=", userId)
      .where("c.id", "=", chatId)
      .set({ title, isStarred })
      .returning([])
      .executeTakeFirstOrThrow();
    return row;
  }

  async start(userId: UserId, input: StartChat) {
    const { model, text, idempotencyKey } = input;
    const files = input.files ?? [];

    await this.s.idempotency.checkDuplicateRequest(idempotencyKey);

    const { fileInfos } = await this.s.s3.uploads(userId, { files });

    const { chat, userChatMessage, modelChatMessage } = await this.s.db
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

    await this.s.task.add("google_gen_ai_send_chat", {
      userChatMessageId: userChatMessage.id,
      modelChatMessageId: modelChatMessage.id,
    });

    return { chat, userChatMessage, modelChatMessage };
  }

  static async createChat(db: Db, input: { userId: UserId; text: string }) {
    const { userId, text } = input;
    const title = [...text].slice(0, 10).join("");
    return await db
      .insertInto("chats")
      .values({ userId, title })
      .returning(["id"])
      .executeTakeFirstOrThrow();
  }
}

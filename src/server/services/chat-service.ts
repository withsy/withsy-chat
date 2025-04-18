import {
  Chat,
  ChatMessageId,
  ChatType,
  type StartChat,
  type UpdateChat,
} from "@/types/chat";
import { cols } from "@/types/common";
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
      .select(cols(Chat, "c"))
      .execute();

    return res;
  }

  async update(userId: UserId, input: UpdateChat) {
    const { chatId, title, isStarred } = input;
    const res = await this.service.db
      .updateTable("chats as c")
      .where("c.userId", "=", userId)
      .where("c.id", "=", chatId)
      .set({ title, isStarred })
      .returning(cols(Chat, "c"))
      .executeTakeFirstOrThrow();

    return res;
  }

  async start(userId: UserId, input: StartChat) {
    const { model, text, idempotencyKey } = input;
    const files = input.files ?? [];

    await this.service.idempotencyInfo.checkDuplicateRequest(idempotencyKey);

    // TODO: check userId by parentMessageId.

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

  static async createChat(
    db: Db,
    input: { userId: UserId; text: string; parentMessageId?: ChatMessageId }
  ) {
    const { userId, text, parentMessageId } = input;
    const title = [...text].slice(0, 10).join("");
    const type: ChatType = parentMessageId ? "branch" : "chat";
    const res = await db
      .insertInto("chats")
      .values({ userId, title, type, parentMessageId })
      .returning(cols(Chat, "chats"))
      .executeTakeFirstOrThrow();

    return res;
  }
}

import { type StartChat, type UpdateChat } from "@/types/chat";
import type { UserId } from "@/types/user";
import { TRPCError } from "@trpc/server";
import { type Updateable } from "kysely";
import type { Chats } from "kysely-codegen";
import { ChatMessageService } from "./chat-message-service";
import type { Db } from "./db";
import { IdempotencyService } from "./idempotency-service";
import type { TaskService } from "./task-service";

export const CHAT_NOT_FOUND_ERROR = new TRPCError({
  code: "NOT_FOUND",
  message: "Chat not found",
});

export class ChatService {
  constructor(private readonly db: Db, private readonly task: TaskService) {}

  async list(userId: UserId) {
    return await this.db
      .selectFrom("chats")
      .where("userId", "=", userId)
      .orderBy("createdAt", "asc")
      .selectAll()
      .execute();
  }

  async update(input: UpdateChat) {
    const { chatId, title, isStarred } = input;
    const updates: Updateable<Chats> = {};
    if (title !== undefined) updates.title = title;
    if (isStarred !== undefined) updates.isStarred = isStarred;
    return await this.db
      .updateTable("chats")
      .set(updates)
      .where("id", "=", chatId)
      .returningAll()
      .executeTakeFirstOrThrow(() => CHAT_NOT_FOUND_ERROR);
  }

  async start(userId: UserId, input: StartChat) {
    const { model, text, idempotencyKey } = input;
    const { chat, userChatMessage, modelChatMessage } = await this.db
      .transaction()
      .execute(async (tx) => {
        await IdempotencyService.checkDuplicateRequest(tx, idempotencyKey);
        const title = [...text].slice(0, 10).join("");
        const chat = await tx
          .insertInto("chats")
          .values({ userId, title })
          .returningAll()
          .executeTakeFirstOrThrow();
        const { userChatMessage, modelChatMessage } =
          await ChatMessageService.createPair(tx, {
            chatId: chat.id,
            model,
            text,
          });
        return {
          chat,
          userChatMessage,
          modelChatMessage,
        };
      });
    await this.task.add("google_gen_ai_send_chat", {
      userChatMessageId: userChatMessage.id,
      modelChatMessageId: modelChatMessage.id,
    });
    return {
      chat,
      userChatMessage,
      modelChatMessage,
    };
  }
}

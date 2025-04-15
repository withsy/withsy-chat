import {
  ChatId,
  ChatModel,
  type StartChat,
  type UpdateChat,
} from "@/types/chat";
import type { UserId } from "@/types/user";
import { TRPCError } from "@trpc/server";
import { type Updateable } from "kysely";
import type { Chats } from "kysely-codegen";
import type { ServiceRegistry } from "../service-registry";
import { ChatMessageFileService } from "./chat-message-file-service";
import { ChatMessageService } from "./chat-message-service";
import type { Db } from "./db";
import { IdempotencyService } from "./idempotency-service";
import type { FileInfo } from "./mock-s3-service";

export const CHAT_NOT_FOUND_ERROR = new TRPCError({
  code: "NOT_FOUND",
  message: "Chat not found",
});

export class ChatService {
  constructor(private readonly s: ServiceRegistry) {}

  async list(userId: UserId) {
    return await this.s.db
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
    return await this.s.db
      .updateTable("chats")
      .set(updates)
      .where("id", "=", chatId)
      .returningAll()
      .executeTakeFirstOrThrow(() => CHAT_NOT_FOUND_ERROR);
  }

  async start(userId: UserId, input: StartChat) {
    const { model, text, idempotencyKey } = input;
    const files = input.files ?? [];

    const { fileInfos } = await this.s.s3.uploads({ files });

    const { chat, userChatMessage, modelChatMessage } = await this.s.db
      .transaction()
      .execute(async (tx) => {
        await IdempotencyService.checkDuplicateRequest(tx, idempotencyKey);
        const chat = await ChatService.createChat(tx, { userId, text });

        const { userChatMessage, modelChatMessage } =
          await ChatService.createMessageInfo(tx, {
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
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async createMessageInfo(
    db: Db,
    input: {
      chatId: ChatId;
      model: ChatModel;
      text: string;
      fileInfos: FileInfo[];
    }
  ) {
    const { chatId, model, text, fileInfos } = input;

    const { userChatMessage, modelChatMessage } =
      await ChatMessageService.createPair(db, {
        chatId,
        model,
        text,
      });
    await ChatMessageFileService.creates(db, {
      chatMessageId: userChatMessage.id,
      fileInfos,
    });

    return { userChatMessage, modelChatMessage };
  }
}

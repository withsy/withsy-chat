import {
  ChatId,
  ChatMessage,
  ChatMessageStatus,
  ChatRole,
  SendChatMessage,
  UpdateChatMessage,
  type ChatMessageId,
  type ListChatMessages,
} from "@/types/chat";
import { TRPCError } from "@trpc/server";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat-service";
import type { Db } from "./db";
import { IdempotencyService } from "./idempotency-service";

export const CHAT_MESSAGE_NOT_FOUND_ERROR = new TRPCError({
  code: "NOT_FOUND",
  message: "Chat message not found",
});

export class ChatMessageService {
  constructor(private readonly s: ServiceRegistry) {}

  async list(input: ListChatMessages) {
    const { role, isBookmarked, options } = input;
    const { scope, afterId, order, limit } = options;
    let query = this.s.db.selectFrom("chatMessages");
    if (scope.by === "user") {
      query = query
        .innerJoin("chats", "chats.id", "chatMessages.chatId")
        .where("chats.userId", "=", scope.userId)
        .selectAll("chatMessages");
    } else if (scope.by === "chat")
      query = query.where("chatId", "=", scope.chatId);
    if (role !== undefined) query = query.where("role", "=", role);
    if (isBookmarked !== undefined)
      query = query.where("isBookmarked", "=", isBookmarked);
    if (afterId !== undefined) {
      const op = order === "asc" ? ">" : "<";
      query = query.where("id", op, afterId);
    }
    return await query.orderBy("id", order).limit(limit).selectAll().execute();
  }

  async listForAiChatHistory(input: {
    modelChatId: ChatId;
    modelChatMessageId: ChatMessageId;
    modelParentId: ChatMessageId | null;
  }) {
    const { modelChatId, modelChatMessageId, modelParentId } = input;
    // TODO: Change limit history length
    const maxHistoryLength = 10;
    const histories = await this.s.db.transaction().execute(async (tx) => {
      let query = tx
        .selectFrom("chatMessages")
        .where("chatId", "=", modelChatId)
        .where("status", "=", ChatMessageStatus.enum.succeeded)
        .where("text", "is not", null)
        .where("id", "<", modelChatMessageId);
      if (modelParentId !== null)
        query = query.where("parentId", "=", modelParentId);
      query = query
        .orderBy("id", "desc")
        .limit(maxHistoryLength)
        .select(["role", "text"]);
      const histories = await query.execute();
      if (modelParentId !== null) {
        const remainLength = maxHistoryLength - histories.length;
        if (remainLength > 0) {
          const additionalHistories = await tx
            .selectFrom("chatMessages")
            .where("chatId", "=", modelChatId)
            .where("status", "=", ChatMessageStatus.enum.succeeded)
            .where("text", "is not", null)
            .where("id", "<=", modelParentId)
            .where("parentId", "is", null)
            .orderBy("id", "desc")
            .limit(remainLength)
            .select(["role", "text"])
            .execute();
          histories.push(...additionalHistories);
        }
      }
      return histories as {
        role: string;
        text: string;
      }[];
    });
    histories.reverse();
    return histories;
  }

  async findById<K extends keyof ChatMessage>(
    chatMessageId: ChatMessageId,
    keys: K[]
  ) {
    return await this.s.db
      .selectFrom("chatMessages")
      .where("id", "=", chatMessageId)
      .select(keys)
      .executeTakeFirstOrThrow(() => CHAT_MESSAGE_NOT_FOUND_ERROR);
  }

  async update(input: UpdateChatMessage) {
    const { chatMessageId, isBookmarked } = input;
    let query = this.s.db
      .updateTable("chatMessages")
      .where("id", "=", chatMessageId);
    if (isBookmarked !== undefined) query = query.set({ isBookmarked });
    const chatMessage = await query
      .returningAll()
      .executeTakeFirstOrThrow(() => CHAT_MESSAGE_NOT_FOUND_ERROR);
    return await ChatMessage.parseAsync(chatMessage);
  }

  async isStaleCompleted(chatMessageId: ChatMessageId) {
    const chatMessage = await this.s.db
      .selectFrom("chatMessages")
      .where(({ or, and, eb }) =>
        and([
          eb("id", "=", chatMessageId),
          eb("updatedAt", "<", new Date(Date.now() - 5 * 60_000)),
          or([
            eb("status", "=", ChatMessageStatus.enum.succeeded),
            eb("status", "=", ChatMessageStatus.enum.failed),
          ]),
        ])
      )
      .select(["id"])
      .executeTakeFirst();
    return chatMessage != null;
  }

  static async transit(
    db: Db,
    input: {
      chatMessageId: ChatMessageId;
      expectStatus: ChatMessageStatus;
      nextStatus: ChatMessageStatus;
    }
  ) {
    const { chatMessageId, expectStatus, nextStatus } = input;
    return await db
      .updateTable("chatMessages")
      .set({ status: nextStatus })
      .where("id", "=", chatMessageId)
      .where("status", "=", expectStatus)
      .returning("id")
      .executeTakeFirst();
  }

  async transitPendingToProcessing(chatMessageId: ChatMessageId) {
    return await this.s.db.transaction().execute((tx) =>
      ChatMessageService.transit(tx, {
        chatMessageId,
        expectStatus: "pending",
        nextStatus: "processing",
      })
    );
  }

  async transitProcessingToSucceeded(
    chatMessageId: ChatMessageId,
    text: string
  ) {
    return await this.s.db.transaction().execute(async (tx) => {
      await ChatMessageService.transit(tx, {
        chatMessageId,
        expectStatus: "processing",
        nextStatus: "succeeded",
      });
      return await tx
        .updateTable("chatMessages")
        .set({ text })
        .where("id", "=", chatMessageId)
        .executeTakeFirstOrThrow();
    });
  }

  async transitProcessingToFailed(chatMessageId: ChatMessageId) {
    return await this.s.db.transaction().execute((tx) =>
      ChatMessageService.transit(tx, {
        chatMessageId,
        expectStatus: "processing",
        nextStatus: "failed",
      })
    );
  }

  async onCleanupZombiesTask() {
    const { numUpdatedRows } = await this.s.db
      .updateTable("chatMessages")
      .set({ status: "failed" })
      .where("status", "=", "processing")
      .where("updatedAt", "<", new Date(Date.now() - 5 * 60_000)) // 5 minutes
      .executeTakeFirst();
    if (numUpdatedRows > 0)
      console.warn(`Marked ${numUpdatedRows} zombie chat messages as failed.`);
  }

  async send(input: SendChatMessage) {
    const { idempotencyKey, chatId, model, text } = input;
    const files = input.files ?? [];

    const { fileInfos } = await this.s.s3.uploads({ files });

    const { userChatMessage, modelChatMessage } = await this.s.db
      .transaction()
      .execute(async (tx) => {
        await IdempotencyService.checkDuplicateRequest(tx, idempotencyKey);
        return await ChatService.createMessageInfo(tx, {
          chatId,
          model,
          text,
          fileInfos,
        });
      });

    await this.s.task.add("google_gen_ai_send_chat", {
      userChatMessageId: userChatMessage.id,
      modelChatMessageId: modelChatMessage.id,
    });

    return { userChatMessage, modelChatMessage };
  }

  static async createPair(
    db: Db,
    input: Omit<SendChatMessage, "idempotencyKey">
  ) {
    const { chatId, text, model, parentId } = input;

    const userChatMessage = await db
      .insertInto("chatMessages")
      .values({
        chatId,
        text,
        role: ChatRole.enum.user,
        status: ChatMessageStatus.enum.succeeded,
        parentId: parentId ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const modelChatMessage = await db
      .insertInto("chatMessages")
      .values({
        chatId,
        role: ChatRole.enum.model,
        model,
        status: ChatMessageStatus.enum.pending,
        parentId: parentId ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      userChatMessage,
      modelChatMessage,
    };
  }
}

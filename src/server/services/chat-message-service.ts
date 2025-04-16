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
import type { UserId } from "@/types/user";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat-service";
import type { Db } from "./db";
import { IdempotencyService } from "./idempotency-service";

export class ChatMessageService {
  constructor(private readonly s: ServiceRegistry) {}

  async list(userId: UserId, input: ListChatMessages) {
    const { role, isBookmarked, options } = input;
    const { scope, afterId, order, limit } = options;

    let query = this.s.db
      .selectFrom("chatMessages as cm")
      .innerJoin("chats as c", "c.id", "cm.chatId")
      .where("c.userId", "=", userId);

    if (scope.by === "user") {
      // noop
    } else if (scope.by === "chat")
      query = query.where("cm.chatId", "=", scope.chatId);

    if (role !== undefined) query = query.where("cm.role", "=", role);

    if (isBookmarked !== undefined)
      query = query.where("cm.isBookmarked", "=", isBookmarked);

    if (afterId !== undefined) {
      const op = order === "asc" ? ">" : "<";
      query = query.where("cm.id", op, afterId);
    }

    const rows = await query
      .orderBy("cm.id", order)
      .limit(limit)
      .select([
        "cm.isBookmarked",
        "cm.model",
        "cm.role",
        "cm.status",
        "cm.text",
        "cm.parentId",
      ])
      .execute();

    return rows;
  }

  async listForAiChatHistory(
    userId: UserId,
    input: {
      modelChatId: ChatId;
      modelChatMessageId: ChatMessageId;
      modelParentId: ChatMessageId | null;
    }
  ) {
    const { modelChatId, modelChatMessageId, modelParentId } = input;

    // TODO: Change limit history length
    let remainLength = 10;
    const histories = await this.s.db.transaction().execute(async (tx) => {
      const baseQuery = tx
        .selectFrom("chatMessages as cm")
        .innerJoin("chats as c", "c.id", "cm.chatId")
        .where("c.userId", "=", userId)
        .where("cm.chatId", "=", modelChatId)
        .where("cm.status", "=", ChatMessageStatus.enum.succeeded)
        .where("cm.text", "is not", null)
        .select(["cm.role", "cm.text"])
        .orderBy("cm.id", "desc");

      const histories: {
        role: string;
        text: string | null;
      }[] = [];
      let oldestId = -1;

      // branch messages
      if (modelParentId !== null) {
        if (remainLength > 0) {
          const rows = await baseQuery
            .where("cm.id", "<", modelChatMessageId)
            .where("cm.parentId", "=", modelParentId)
            .select("cm.id")
            .limit(remainLength)
            .execute();
          histories.push(...rows);
          remainLength -= rows.length;
          oldestId = rows.at(-1)?.id ?? -1;
        }

        // parent message
        if (remainLength > 0) {
          const parent = await baseQuery
            .where("cm.id", "=", modelParentId)
            .where("cm.parentId", "is", null)
            .select(["cm.id", "cm.replyToId"])
            .executeTakeFirst();
          if (parent) {
            histories.push(parent);
            remainLength -= 1;
            oldestId = parent.id;

            // reply to message
            if (remainLength > 0 && parent.replyToId !== null) {
              const replyTo = await baseQuery
                .where("cm.id", "=", parent.replyToId)
                .where("cm.parentId", "is", null)
                .select("cm.id")
                .executeTakeFirst();
              if (replyTo) {
                histories.push(replyTo);
                remainLength -= 1;
                oldestId = replyTo.id;
              }
            }
          }
        }
      }

      // non-branch messages
      if (remainLength > 0) {
        let query = baseQuery;
        if (oldestId !== -1) query = query.where("cm.id", "<", oldestId);
        const rows = await query
          .where("cm.parentId", "is", null)
          .limit(remainLength)
          .execute();
        histories.push(...rows);
        remainLength -= rows.length;
      }

      return histories;
    });

    // sort newest to oldest
    histories.reverse();
    return histories as { role: string; text: string }[];
  }

  async find(userId: UserId, input: { chatMessageId: ChatMessageId }) {
    const { chatMessageId } = input;
    const row = await this.s.db
      .selectFrom("chatMessages as cm")
      .innerJoin("chats as c", "c.id", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("cm.id", "=", chatMessageId)
      .select([])
      .executeTakeFirstOrThrow();
    return row;
  }

  async update(userId: UserId, input: UpdateChatMessage) {
    const { chatMessageId, isBookmarked } = input;
    const row = await this.s.db
      .updateTable("chatMessages as cm")
      .innerJoin("chats as c", "c.id", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("cm.id", "=", chatMessageId)
      .set({ isBookmarked })
      .returning([])
      .executeTakeFirstOrThrow();
    return row;
  }

  async isStaleCompleted(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const chatMessage = await this.s.db
      .selectFrom("chatMessages as cm")
      .innerJoin("chats as c", "c.id", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("cm.id", "=", chatMessageId)
      .where("cm.updatedAt", "<", new Date(Date.now() - 5 * 60_000)) // 5 minutes
      .where(({ or, eb }) =>
        or([
          eb("cm.status", "=", ChatMessageStatus.enum.succeeded),
          eb("cm.status", "=", ChatMessageStatus.enum.failed),
        ])
      )
      .select(["cm.id"])
      .executeTakeFirst();
    return !!chatMessage;
  }

  static async transit(
    db: Db,
    userId: UserId,
    input: {
      chatMessageId: ChatMessageId;
      expectStatus: ChatMessageStatus;
      nextStatus: ChatMessageStatus;
    }
  ) {
    const { chatMessageId, expectStatus, nextStatus } = input;
    const row = await db
      .updateTable("chatMessages as cm")
      .innerJoin("chats as c", "c.id", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("cm.id", "=", chatMessageId)
      .where("cm.status", "=", expectStatus)
      .set({ status: nextStatus })
      .returning("cm.id")
      .executeTakeFirst();
    return row;
  }

  async transitPendingToProcessing(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const row = await ChatMessageService.transit(this.s.db, userId, {
      chatMessageId,
      expectStatus: "pending",
      nextStatus: "processing",
    });
    return row;
  }

  async transitProcessingToSucceeded(
    userId: UserId,
    input: { chatMessageId: ChatMessageId; text: string }
  ) {
    const { chatMessageId, text } = input;
    await this.s.db.transaction().execute(async (tx) => {
      const row = await ChatMessageService.transit(tx, userId, {
        chatMessageId,
        expectStatus: "processing",
        nextStatus: "succeeded",
      });
      if (!row)
        throw new HttpServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          `Chat message transition failed. chatMessageId: ${chatMessageId} status: processing to succeeded.`
        );

      await tx
        .updateTable("chatMessages as cm")
        .innerJoin("chats as c", "c.id", "cm.chatId")
        .where("c.userId", "=", userId)
        .where("cm.id", "=", chatMessageId)
        .set({ text })
        .executeTakeFirstOrThrow();
    });
  }

  async tryTransitProcessingToFailed(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const row = await ChatMessageService.transit(this.s.db, userId, {
      chatMessageId,
      expectStatus: "processing",
      nextStatus: "failed",
    });
    if (!row)
      console.warn(
        `Chat message transition failed. chatMessageId: ${chatMessageId} status: processing to failed.`
      );
  }

  async onCleanupZombiesTask() {
    const { numUpdatedRows } = await this.s.db
      .updateTable("chatMessages as cm")
      .where("cm.status", "=", "processing")
      .where("cm.updatedAt", "<", new Date(Date.now() - 5 * 60_000)) // 5 minutes
      .set({ status: "failed" })
      .executeTakeFirst();
    if (numUpdatedRows > 0)
      console.warn(`Marked ${numUpdatedRows} zombie chat messages as failed.`);
  }

  async send(userId: UserId, input: SendChatMessage) {
    const { idempotencyKey, chatId, model, text } = input;
    const files = input.files ?? [];

    const { fileInfos } = await this.s.s3.uploads(userId, { files });

    const { userChatMessage, modelChatMessage } = await this.s.db
      .transaction()
      .execute(async (tx) => {
        await IdempotencyService.checkDuplicateRequest(tx, idempotencyKey);
        // WIP
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
        replyToId: userChatMessage.id,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      userChatMessage,
      modelChatMessage,
    };
  }
}

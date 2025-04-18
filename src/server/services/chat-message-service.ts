import {
  ChatId,
  ChatMessageId,
  ChatMessageSchema,
  ChatMessageStatus,
  ChatRole,
  ChatSchema,
  SendChatMessage,
  UpdateChatMessage,
  type ListChatMessages,
} from "@/types/chat";
import { cols } from "@/types/common";
import type { UserId } from "@/types/user";
import { StatusCodes } from "http-status-codes";
import type { Expression } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import { ChatMessageFileService } from "./chat-message-file-service";
import type { Db } from "./db";
import type { FileInfo } from "./mock-s3-service";

type History = {
  role: string;
  text: string;
};

function withChat(db: Db, chatId: Expression<string>) {
  return jsonObjectFrom(
    db
      .selectFrom("chats")
      .where("chats.id", "=", chatId)
      .select(cols(ChatSchema, "chats"))
  );
}

export class ChatMessageService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId, input: ListChatMessages) {
    const { role, isBookmarked, options } = input;
    const { scope, afterId, order, limit, include } = options;

    let query = this.service.db
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

    const res = await query
      .orderBy("cm.id", order)
      .limit(limit)
      .select((eb) =>
        [
          ...cols(ChatMessageSchema, "cm"),
          include?.chat
            ? withChat(this.service.db, eb.ref("cm.chatId")).as("chat")
            : undefined,
        ].filter((x) => x != null)
      )
      .execute();

    return res;
  }

  async listForAiChatHistory(
    userId: UserId,
    input: {
      modelChatMessage: {
        id: ChatMessageId;
        chatId: ChatId;
      };
    }
  ) {
    const { modelChatMessage } = input;

    // TODO: Change limit history length
    const remainLength = 10;
    const histories = await this.service.db
      .transaction()
      .execute(async (tx) => {
        const baseQuery = tx
          .selectFrom("chatMessages as cm")
          .innerJoin("chats as c", "c.id", "cm.chatId")
          .where("c.userId", "=", userId)
          .where("cm.chatId", "=", modelChatMessage.chatId)
          .where("cm.status", "=", ChatMessageStatus.enum.succeeded)
          .where("cm.text", "is not", null)
          .select(["cm.role", "cm.text"])
          .orderBy("cm.id", "desc");

        const histories: History[] = [];
        const oldestId = -1;

        // // branch messages
        // if (modelChatMessage.parentId !== null) {
        //   if (remainLength > 0) {
        //     const rows = await baseQuery
        //       .where("cm.id", "<", modelChatMessage.id)
        //       .where("cm.parentId", "=", modelChatMessage.parentId)
        //       .select("cm.id")
        //       .limit(remainLength)
        //       .execute();

        //     histories.push(
        //       ...rows.map((x) => {
        //         if (x.text === null)
        //           throw new Error("text must have a not null query applied.");
        //         return { role: x.role, text: x.text };
        //       })
        //     );
        //     remainLength -= rows.length;
        //     oldestId = rows.at(-1)?.id ?? -1;
        //   }

        //   // parent message
        //   if (remainLength > 0) {
        //     const parent = await baseQuery
        //       .where("cm.id", "=", modelChatMessage.parentId)
        //       .where("cm.parentId", "is", null)
        //       .select(["cm.id", "cm.replyToId"])
        //       .executeTakeFirst();
        //     if (parent) {
        //       if (parent.text === null)
        //         throw new Error("text must have a not null query applied.");
        //       histories.push({
        //         role: parent.role,
        //         text: parent.text,
        //       });
        //       remainLength -= 1;
        //       oldestId = parent.id;

        //       // reply to message
        //       if (remainLength > 0 && parent.replyToId !== null) {
        //         const replyTo = await baseQuery
        //           .where("cm.id", "=", parent.replyToId)
        //           .where("cm.parentId", "is", null)
        //           .select("cm.id")
        //           .executeTakeFirst();
        //         if (replyTo) {
        //           if (replyTo.text === null)
        //             throw new Error("text must have a not null query applied.");
        //           histories.push({
        //             role: replyTo.role,
        //             text: replyTo.text,
        //           });
        //           remainLength -= 1;
        //           oldestId = replyTo.id;
        //         }
        //       }
        //     }
        //   }
        // }

        // // non-branch messages
        // if (remainLength > 0) {
        //   let query = baseQuery;
        //   if (oldestId !== -1) query = query.where("cm.id", "<", oldestId);
        //   const rows = await query
        //     .where("cm.parentId", "is", null)
        //     .limit(remainLength)
        //     .execute();
        //   histories.push(
        //     ...rows.map((x) => {
        //       if (x.text === null)
        //         throw new Error("text must have a not null query applied.");
        //       return { role: x.role, text: x.text };
        //     })
        //   );
        //   remainLength -= rows.length;
        // }

        return histories;
      });

    histories.reverse(); // to oldest
    return histories;
  }

  async find(userId: UserId, input: { chatMessageId: ChatMessageId }) {
    const { chatMessageId } = input;
    const res = await this.service.db
      .selectFrom("chatMessages as cm")
      .innerJoin("chats as c", "c.id", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("cm.id", "=", chatMessageId)
      .select(cols(ChatMessageSchema, "cm"))
      .executeTakeFirstOrThrow();

    return res;
  }

  async update(userId: UserId, input: UpdateChatMessage) {
    const { chatMessageId, isBookmarked } = input;
    const res = await this.service.db
      .updateTable("chatMessages as cm")
      .from("chats as c")
      .whereRef("c.id", "=", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("cm.id", "=", chatMessageId)
      .set({ isBookmarked })
      .returning(cols(ChatMessageSchema, "cm"))
      .executeTakeFirstOrThrow();
    return res;
  }

  async isStaleCompleted(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const res = await this.service.db
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

    return !!res;
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
    const res = await db
      .updateTable("chatMessages as cm")
      .from("chats as c")
      .whereRef("c.id", "=", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("cm.id", "=", chatMessageId)
      .where("cm.status", "=", expectStatus)
      .set({ status: nextStatus })
      .returning("cm.id")
      .executeTakeFirst();

    return res;
  }

  async transitPendingToProcessing(
    userId: UserId,
    input: { chatMessageId: ChatMessageId }
  ) {
    const { chatMessageId } = input;
    const res = await this.service.db.transaction().execute(async (tx) => {
      const res = await ChatMessageService.transit(tx, userId, {
        chatMessageId,
        expectStatus: "pending",
        nextStatus: "processing",
      });
      return res;
    });

    return res;
  }

  async transitProcessingToSucceeded(
    userId: UserId,
    input: { chatMessageId: ChatMessageId; text: string }
  ) {
    const { chatMessageId, text } = input;
    await this.service.db.transaction().execute(async (tx) => {
      const res = await ChatMessageService.transit(tx, userId, {
        chatMessageId,
        expectStatus: "processing",
        nextStatus: "succeeded",
      });
      if (!res)
        throw new HttpServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          `Chat message transition failed. chatMessageId: ${chatMessageId} status: processing to succeeded.`
        );

      await tx
        .updateTable("chatMessages as cm")
        .from("chats as c")
        .whereRef("c.id", "=", "cm.chatId")
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
    const res = await this.service.db.transaction().execute(async (tx) => {
      const res = await ChatMessageService.transit(tx, userId, {
        chatMessageId,
        expectStatus: "processing",
        nextStatus: "failed",
      });
      return res;
    });
    if (!res)
      console.warn(
        `Chat message transition failed. chatMessageId: ${chatMessageId} status: processing to failed.`
      );
  }

  async onCleanupZombiesTask() {
    const { numUpdatedRows } = await this.service.db
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

    await this.service.idempotencyInfo.checkDuplicateRequest(idempotencyKey);

    const { fileInfos } = await this.service.s3.uploads(userId, { files });

    const { userChatMessage, modelChatMessage } = await this.service.db
      .transaction()
      .execute(async (tx) => {
        const res = await ChatMessageService.createInfo(tx, {
          chatId,
          model,
          text,
          fileInfos,
        });
        return res;
      });

    await this.service.task.add("google_gen_ai_send_chat", {
      userId,
      userChatMessageId: userChatMessage.id,
      modelChatMessageId: modelChatMessage.id,
    });

    return {
      userChatMessage,
      modelChatMessage,
    };
  }

  static async createInfo(
    db: Db,
    input: Omit<SendChatMessage, "idempotencyKey" | "files"> & {
      fileInfos: FileInfo[];
    }
  ) {
    const { chatId, text, model, fileInfos } = input;

    const userChatMessage = await db
      .insertInto("chatMessages")
      .values({
        chatId,
        text,
        role: ChatRole.enum.user,
        status: ChatMessageStatus.enum.succeeded,
      })
      .returning(cols(ChatMessageSchema, "chatMessages"))
      .executeTakeFirstOrThrow();

    const modelChatMessage = await db
      .insertInto("chatMessages")
      .values({
        chatId,
        role: ChatRole.enum.model,
        model,
        status: ChatMessageStatus.enum.pending,
        replyToId: userChatMessage.id,
      })
      .returning(cols(ChatMessageSchema, "chatMessages"))
      .executeTakeFirstOrThrow();

    await ChatMessageFileService.createAll(db, {
      chatMessageId: userChatMessage.id,
      fileInfos,
    });

    return {
      userChatMessage,
      modelChatMessage,
    };
  }
}

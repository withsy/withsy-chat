import {
  ChatId,
  ChatMessage,
  ChatMessageStatus,
  ChatRole,
  SendChatMessage,
  type ChatMessageId,
  type ListChatMessages,
} from "@/types/chat";
import { TRPCError } from "@trpc/server";
import type { Db, Tx } from "./db";
import type { ServiceMap } from "./global";
import { IdempotencyService } from "./idempotency-service";

export const CHAT_MESSAGE_NOT_FOUND_ERROR = new TRPCError({
  code: "NOT_FOUND",
  message: "Chat message not found",
});

export class ChatMessageService {
  constructor(private readonly s: ServiceMap) {}

  async list(input: ListChatMessages): Promise<ChatMessage[]> {
    const { chatId } = input;
    const chatMessages = await this.s.db
      .selectFrom("chatMessages")
      .where("chatId", "=", chatId)
      .orderBy("id", "asc")
      .selectAll()
      .execute();
    return await Promise.all(
      chatMessages.map((x) => ChatMessage.parseAsync(x))
    );
  }

  async listForAiChatHistory(chatId: ChatId) {
    return (await this.s.db
      .selectFrom("chatMessages")
      .where("chatId", "=", chatId)
      .where("status", "=", ChatMessageStatus.enum.succeeded)
      .where("text", "is not", null)
      .orderBy("id", "asc")
      .select(["role", "text"])
      .execute()) as { role: string; text: string }[];
  }

  async findById(chatMessageId: ChatMessageId, keys: (keyof ChatMessage)[]) {
    return await this.s.db
      .selectFrom("chatMessages")
      .where("id", "=", chatMessageId)
      .select(keys)
      .executeTakeFirstOrThrow(() => CHAT_MESSAGE_NOT_FOUND_ERROR);
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
    const { idempotencyKey } = input;
    const { userChatMessage, modelChatMessage } = await this.s.db
      .transaction()
      .execute(async (tx) => {
        await IdempotencyService.checkDuplicateRequest(tx, idempotencyKey);
        return await ChatMessageService.createPair(tx, input);
      });
    await this.s.task.add("google_gen_ai_send_chat", {
      userChatMessageId: userChatMessage.id,
      modelChatMessageId: modelChatMessage.id,
    });
    return { userChatMessage, modelChatMessage };
  }

  static async createPair(
    tx: Tx,
    input: Omit<SendChatMessage, "idempotencyKey">
  ) {
    const { chatId, text, model } = input;
    const userChatMessage = await tx
      .insertInto("chatMessages")
      .values({
        chatId,
        text,
        role: ChatRole.enum.user,
        status: ChatMessageStatus.enum.succeeded,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    const modelChatMessage = await tx
      .insertInto("chatMessages")
      .values({
        chatId,
        role: ChatRole.enum.model,
        model,
        status: ChatMessageStatus.enum.pending,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return {
      userChatMessage,
      modelChatMessage,
    };
  }
}

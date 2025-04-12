import {
  ChatMessage,
  ChatMessageStatus,
  ChatRole,
  SendChatMessage,
  type ChatMessageId,
  type ListChatMessages,
} from "@/types/chat";
import { TRPCError } from "@trpc/server";
import type { Tx } from "./db";
import type { Registry } from "./global";

export const CHAT_MESSAGE_NOT_FOUND_ERROR = new TRPCError({
  code: "NOT_FOUND",
  message: "Chat message not found",
});

export class ChatMessageService {
  constructor(private readonly r: Registry) {}

  async list(input: ListChatMessages): Promise<ChatMessage[]> {
    const { chatId } = input;
    const chatMessages = await this.r
      .get("db")
      .selectFrom("chatMessages")
      .where("chatId", "=", chatId)
      .orderBy("createdAt", "asc")
      .selectAll()
      .execute();
    return await Promise.all(
      chatMessages.map((x) => ChatMessage.parseAsync(x))
    );
  }

  async findById(chatMessageId: ChatMessageId, keys: (keyof ChatMessage)[]) {
    return await this.r
      .get("db")
      .selectFrom("chatMessages")
      .where("id", "=", chatMessageId)
      .select(keys)
      .executeTakeFirstOrThrow(() => CHAT_MESSAGE_NOT_FOUND_ERROR);
  }

  async isStaleCompleted(chatMessageId: ChatMessageId) {
    const chatMessage = await this.r
      .get("db")
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
    tx: Tx,
    input: {
      chatMessageId: ChatMessageId;
      expectStatus: ChatMessageStatus;
      nextStatus: ChatMessageStatus;
    }
  ) {
    const { chatMessageId, expectStatus, nextStatus } = input;
    return await tx
      .updateTable("chatMessages")
      .set({ status: nextStatus })
      .where("id", "=", chatMessageId)
      .where("status", "=", expectStatus)
      .returning("id")
      .executeTakeFirst();
  }

  async transitPendingToProcessing(chatMessageId: ChatMessageId) {
    return await this.r
      .get("db")
      .transaction()
      .execute((tx) =>
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
    return await this.r
      .get("db")
      .transaction()
      .execute(async (tx) => {
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
    return await this.r
      .get("db")
      .transaction()
      .execute((tx) =>
        ChatMessageService.transit(tx, {
          chatMessageId,
          expectStatus: "processing",
          nextStatus: "failed",
        })
      );
  }

  async onCleanupZombiesTask() {
    const { numUpdatedRows } = await this.r
      .get("db")
      .updateTable("chatMessages")
      .set({ status: "failed" })
      .where("status", "=", "processing")
      .where("updatedAt", "<", new Date(Date.now() - 5 * 60_000)) // 5 minutes
      .executeTakeFirst();
    if (numUpdatedRows > 0)
      console.warn(`Marked ${numUpdatedRows} zombie chat messages as failed.`);
  }

  async send(input: SendChatMessage) {
    const { userChatMessage, modelChatMessage } = await this.r
      .get("db")
      .transaction()
      .execute((tx) => ChatMessageService.createPair(tx, input));
    await this.r.get("task").add("google_gen_ai_send_chat", {
      userChatMessageId: userChatMessage.id,
      modelChatMessageId: modelChatMessage.id,
    });
    return { userChatMessage, modelChatMessage };
  }

  static async createPair(tx: Tx, input: SendChatMessage) {
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

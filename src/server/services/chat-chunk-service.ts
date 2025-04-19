import {
  ChatMessageId,
  type ChatChunkIndex,
  type ReceiveChatChunkStream,
} from "@/types/chat";
import { type JsonValue } from "@/types/common";
import { PgEvent, type PgEventInput } from "@/types/task";
import type { UserId } from "@/types/user";
import { tracked } from "@trpc/server";
import type { ServiceRegistry } from "../service-registry";
import { listen } from "./pg";

export class ChatChunkService {
  constructor(private readonly service: ServiceRegistry) {}

  async add(input: {
    chatMessageId: ChatMessageId;
    chunkIndex: ChatChunkIndex;
    rawData: JsonValue;
    text: string;
  }) {
    const { chatMessageId, chunkIndex, text, rawData } = input;
    await this.service.db
      .insertInto("chatChunks")
      .values({
        chatMessageId,
        chunkIndex,
        text,
        rawData,
      })
      .execute();
  }

  async buildText(userId: UserId, chatMessageId: ChatMessageId) {
    const rows = await this.service.db
      .selectFrom("chatChunks as cc")
      .innerJoin("chatMessages as cm", "cm.id", "cc.chatMessageId")
      .innerJoin("chats as c", "c.id", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("c.deletedAt", "is", null)
      .where("cc.chatMessageId", "=", chatMessageId)
      .select(["cc.text"])
      .orderBy("cc.chunkIndex", "asc")
      .execute();

    const text = rows.map((x) => x.text).join("");
    return { text };
  }

  async *receiveStream(userId: UserId, input: ReceiveChatChunkStream) {
    const { chatMessageId, lastEventId } = input;
    const q: PgEventInput<"chat_chunk_created">[] = [];

    const unlisten = await listen(
      this.service.pool,
      "chat_chunk_created",
      PgEvent.chat_chunk_created,
      (input) => {
        if (input.chatMessageId !== chatMessageId) return;
        q.push(input);
      }
    );

    try {
      let lastChunkIndex = lastEventId ?? -1;
      const chatChunks = await this.service.db
        .selectFrom("chatChunks as cc")
        .innerJoin("chatMessages as cm", "cm.id", "cc.chatMessageId")
        .innerJoin("chats as c", "c.id", "cm.chatId")
        .where("c.userId", "=", userId)
        .where("c.deletedAt", "is", null)
        .where("cc.chatMessageId", "=", chatMessageId)
        .where("cc.chunkIndex", ">", lastChunkIndex)
        .orderBy("cc.chunkIndex", "asc")
        .select(["cc.text", "cc.chunkIndex", "cc.chatMessageId"])
        .execute();

      for (const chatChunk of chatChunks) {
        yield tracked(chatChunk.chunkIndex.toString(), chatChunk);
        lastChunkIndex = chatChunk.chunkIndex;
      }

      while (true) {
        const input = q.shift();
        if (input) {
          const { status } = input;
          if (status === "completed") {
            return;
          }

          const { chunkIndex } = input;
          if (chunkIndex > lastChunkIndex) {
            const chatChunk = await this.service.db
              .selectFrom("chatChunks as cc")
              .innerJoin("chatMessages as cm", "cm.id", "cc.chatMessageId")
              .innerJoin("chats as c", "c.id", "cm.chatId")
              .where("c.userId", "=", userId)
              .where("c.deletedAt", "is", null)
              .where("cc.chatMessageId", "=", chatMessageId)
              .where("cc.chunkIndex", "=", chunkIndex)
              .select(["cc.text", "cc.chunkIndex", "cc.chatMessageId"])
              .executeTakeFirstOrThrow();

            yield tracked(chunkIndex.toString(), chatChunk);
            lastChunkIndex = chunkIndex;
          }
        } else {
          if (
            await this.service.chatMessage.isStaleCompleted(userId, {
              chatMessageId,
            })
          ) {
            return;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } finally {
      await unlisten();
    }
  }
}

import {
  ChatChunk,
  ChatMessageId,
  type ChatChunkIndex,
  type ReceiveChatChunkStream,
} from "@/types/chat";
import type { JsonValue } from "@/types/common";
import { PgEvent, type PgEventInput } from "@/types/task";
import { tracked } from "@trpc/server";
import type { Pool } from "pg";
import type { ChatMessageService } from "./chat-message-service";
import type { Db } from "./db";
import { listen } from "./pg";

export class ChatChunkService {
  constructor(
    private readonly pool: Pool,
    private readonly db: Db,
    private readonly chatMessage: ChatMessageService
  ) {}

  async add(input: {
    chatMessageId: ChatMessageId;
    chunkIndex: ChatChunkIndex;
    rawData: JsonValue;
    text: string;
  }) {
    const { chatMessageId, chunkIndex, text, rawData } = input;
    await this.db
      .insertInto("chatChunks")
      .values({
        chatMessageId,
        chunkIndex,
        text,
        rawData,
      })
      .execute();
  }

  async buildText(chatMessageId: ChatMessageId): Promise<string> {
    const chatChunks = await this.db
      .selectFrom("chatChunks")
      .where("chatMessageId", "=", chatMessageId)
      .select(["text"])
      .orderBy("chunkIndex", "asc")
      .execute();
    const text = chatChunks.map((x) => x.text).join("");
    return text;
  }

  async *receiveStream(input: ReceiveChatChunkStream) {
    const { chatMessageId, lastEventId } = input;
    const q: PgEventInput<"chat_chunk_created">[] = [];

    const unlisten = await listen(
      this.pool,
      "chat_chunk_created",
      PgEvent.chat_chunk_created,
      (input) => {
        if (input.chatMessageId !== chatMessageId) return;
        q.push(input);
      }
    );

    try {
      let lastChunkIndex = lastEventId ?? -1;
      const chatChunks = await this.db
        .selectFrom("chatChunks")
        .where("chatMessageId", "=", chatMessageId)
        .where("chunkIndex", ">", lastChunkIndex)
        .orderBy("chunkIndex", "asc")
        .selectAll()
        .execute();
      for (const chatChunk of chatChunks) {
        yield tracked(
          chatChunk.chunkIndex.toString(),
          await ChatChunk.parseAsync(chatChunk)
        );
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
            const chatChunk = await this.db
              .selectFrom("chatChunks")
              .where("chatMessageId", "=", chatMessageId)
              .where("chunkIndex", "=", chunkIndex)
              .selectAll()
              .executeTakeFirstOrThrow();
            yield tracked(
              chunkIndex.toString(),
              await ChatChunk.parseAsync(chatChunk)
            );
            lastChunkIndex = chunkIndex;
          }
        } else {
          if (await this.chatMessage.isStaleCompleted(chatMessageId)) {
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

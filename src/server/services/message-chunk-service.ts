import type { ChatMessageId } from "@/types/chat-message";
import {
  ChatMessageChunkSelect,
  type ChatMessageChunkIndex,
} from "@/types/chat-message-chunk";
import type { MessageChunkReceive } from "@/types/message-chunk";
import { PgEvent, type PgEventInput } from "@/types/task";
import type { UserId } from "@/types/user";
import type { Prisma } from "@prisma/client";
import { tracked } from "@trpc/server";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import { listen } from "./pg";

export class MessageChunkService {
  constructor(private readonly service: ServiceRegistry) {}

  async add(input: {
    messageId: ChatMessageId;
    chunkIndex: ChatMessageChunkIndex;
    rawData: Prisma.InputJsonValue;
    text: string;
  }) {
    const { messageId, chunkIndex, text, rawData } = input;
    await this.service.db.chatMessageChunk.create({
      data: {
        chatMessageId: messageId,
        chunkIndex,
        text,
        rawData,
      },
      select: ChatMessageChunkSelect,
    });
  }

  static async buildText(
    tx: Tx,
    input: { userId: UserId; messageId: ChatMessageId }
  ) {
    const { userId, messageId } = input;
    const rows = await tx.chatMessageChunk.findMany({
      where: {
        chatMessage: {
          chat: {
            userId,
            deletedAt: null,
          },
        },
        chatMessageId: messageId,
      },
      select: ChatMessageChunkSelect,
      orderBy: {
        chunkIndex: "asc",
      },
    });

    const text = rows.map((x) => x.text).join("");
    return { text };
  }

  async *receive(userId: UserId, input: MessageChunkReceive) {
    const { messageId, lastEventId } = input;
    const q: PgEventInput<"message_chunk_created">[] = [];

    const unlisten = await listen(
      this.service.pgPool,
      "message_chunk_created",
      PgEvent.message_chunk_created,
      (input) => {
        if (input.messageId !== messageId) return;
        q.push(input);
      }
    );

    try {
      let lastChunkIndex = lastEventId ?? -1;
      const chunks = await this.service.db.chatMessageChunk.findMany({
        where: {
          chatMessage: {
            chat: {
              userId,
              deletedAt: null,
            },
          },
          chatMessageId: messageId,
          chunkIndex: {
            gt: lastChunkIndex,
          },
        },
        orderBy: {
          chunkIndex: "asc",
        },
        select: {
          ...ChatMessageChunkSelect,
          chunkIndex: true,
        },
      });

      for (const chunk of chunks) {
        yield tracked(chunk.chunkIndex.toString(), { text: chunk.text });
        lastChunkIndex = chunk.chunkIndex;
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
            const chunk =
              await this.service.db.chatMessageChunk.findUniqueOrThrow({
                where: {
                  chatMessage: {
                    chat: {
                      userId,
                      deletedAt: null,
                    },
                  },
                  chatMessageId_chunkIndex: {
                    chatMessageId: messageId,
                    chunkIndex,
                  },
                },
                select: ChatMessageChunkSelect,
              });

            yield tracked(chunkIndex.toString(), chunk);
            lastChunkIndex = chunkIndex;
          }
        } else {
          if (
            await this.service.message.isStaleCompleted({
              userId,
              messageId,
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

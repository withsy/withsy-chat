import type { MessageId } from "@/types/message";
import {
  MessageChunkSelect,
  type MessageChunkIndex,
  type MessageChunkReceive,
} from "@/types/message-chunk";
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
    messageId: MessageId;
    index: MessageChunkIndex;
    rawData: Prisma.InputJsonValue;
    text: string;
  }) {
    const { messageId, index, text, rawData } = input;
    await this.service.db.messageChunk.create({
      data: {
        messageId,
        index,
        text,
        rawData,
      },
      select: MessageChunkSelect,
    });
  }

  static async buildText(
    tx: Tx,
    input: { userId: UserId; messageId: MessageId }
  ) {
    const { userId, messageId } = input;
    const rows = await tx.messageChunk.findMany({
      where: {
        message: {
          chat: {
            userId,
            deletedAt: null,
          },
        },
        messageId,
      },
      select: MessageChunkSelect,
      orderBy: {
        index: "asc",
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
      let lastIndex = lastEventId ?? -1;
      const chunks = await this.service.db.messageChunk.findMany({
        where: {
          message: {
            chat: {
              userId,
              deletedAt: null,
            },
          },
          messageId,
          index: {
            gt: lastIndex,
          },
        },
        orderBy: {
          index: "asc",
        },
        select: {
          ...MessageChunkSelect,
          index: true,
        },
      });

      for (const chunk of chunks) {
        yield tracked(chunk.index.toString(), { text: chunk.text });
        lastIndex = chunk.index;
      }

      while (true) {
        const input = q.shift();
        if (input) {
          const { status } = input;
          if (status === "completed") {
            return;
          }

          const { index } = input;
          if (index > lastIndex) {
            const chunk = await this.service.db.messageChunk.findUniqueOrThrow({
              where: {
                message: {
                  chat: {
                    userId,
                    deletedAt: null,
                  },
                },
                messageId_index: {
                  messageId,
                  index,
                },
              },
              select: MessageChunkSelect,
            });

            yield tracked(index.toString(), chunk);
            lastIndex = index;
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

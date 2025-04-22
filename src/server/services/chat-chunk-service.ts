import {
  ChatMessageId,
  type ChatChunkIndex,
  type ReceiveChatChunkStream,
} from "@/types/chat";
import { PgEvent, type PgEventInput } from "@/types/task";
import type { UserId } from "@/types/user";
import type { Prisma } from "@prisma/client";
import { tracked } from "@trpc/server";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import { listen } from "./pg";

export class ChatChunkService {
  constructor(private readonly service: ServiceRegistry) {}

  async add(input: {
    chatMessageId: ChatMessageId;
    chunkIndex: ChatChunkIndex;
    rawData: Prisma.InputJsonValue;
    text: string;
  }) {
    const { chatMessageId, chunkIndex, text, rawData } = input;
    await this.service.db.chatChunk.create({
      data: {
        chatMessageId,
        chunkIndex,
        text,
        rawData,
      },
    });
  }

  static async buildText(tx: Tx, userId: UserId, chatMessageId: ChatMessageId) {
    const rows = await tx.chatChunk.findMany({
      where: {
        chatMessage: {
          chat: {
            userId,
            deletedAt: null,
          },
        },
        chatMessageId,
      },
      select: {
        text: true,
      },
      orderBy: {
        chunkIndex: "asc",
      },
    });

    const text = rows.map((x) => x.text).join("");
    return { text };
  }

  async *receiveStream(userId: UserId, input: ReceiveChatChunkStream) {
    const { chatMessageId, lastEventId } = input;
    const q: PgEventInput<"chat_chunk_created">[] = [];

    const unlisten = await listen(
      this.service.pgPool,
      "chat_chunk_created",
      PgEvent.chat_chunk_created,
      (input) => {
        if (input.chatMessageId !== chatMessageId) return;
        q.push(input);
      }
    );

    try {
      let lastChunkIndex = lastEventId ?? -1;
      const chatChunks = await this.service.db.chatChunk.findMany({
        where: {
          chatMessage: {
            chat: {
              userId,
              deletedAt: null,
            },
          },
          chatMessageId,
          chunkIndex: {
            gt: lastChunkIndex,
          },
        },
        orderBy: {
          chunkIndex: "asc",
        },
        select: {
          text: true,
          chunkIndex: true,
          chatMessageId: true,
        },
      });

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
            const chatChunk = await this.service.db.chatChunk.findUniqueOrThrow(
              {
                where: {
                  chatMessage: {
                    chat: {
                      userId,
                      deletedAt: null,
                    },
                  },
                  chatMessageId_chunkIndex: {
                    chatMessageId,
                    chunkIndex,
                  },
                },
                select: {
                  text: true,
                },
              }
            );

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

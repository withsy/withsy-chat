import { MessageChunk } from "@/types";
import type { MessageChunkIndex, MessageId } from "@/types/id";
import { PgEvent, type PgEventInput } from "@/types/task";
import type { UserId } from "@/types/user";
import type { UserUsageLimit } from "@/types/user-usage-limit";
import { tracked } from "@trpc/server";
import type { ServiceRegistry } from "../service-registry";
import { listen } from "./pg";

export class MessageChunkService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(entity: MessageChunk.Entity): MessageChunk.Data {
    const text = this.service.encryption.decrypt(entity.textEncrypted);
    const data = {
      text,
    } satisfies MessageChunk.Data;
    return data;
  }

  async add(input: {
    messageId: MessageId;
    index: MessageChunkIndex;
    rawData: string;
    text: string;
  }) {
    const { messageId, index, text, rawData } = input;

    const textEncrypted = this.service.encryption.encrypt(text);
    const rawDataEncrypted = this.service.encryption.encrypt(rawData);

    await this.service.db.messageChunk.create({
      data: {
        messageId,
        index,
        textEncrypted,
        rawDataEncrypted,
      },
      select: { index: true },
    });
  }

  async buildText(input: {
    userId: UserId;
    messageId: MessageId;
  }): Promise<string> {
    const { userId, messageId } = input;

    const entities = await this.service.db.messageChunk.findMany({
      where: {
        message: { chat: { userId, deletedAt: null } },
        messageId,
      },
      select: MessageChunk.Select,
      orderBy: { index: "asc" },
    });

    const text = entities.map((x) => this.decrypt(x).text).join("");
    return text;
  }

  async *receive(userId: UserId, input: MessageChunk.Receive) {
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
      const entities = await this.service.db.messageChunk.findMany({
        where: {
          message: { chat: { userId, deletedAt: null } },
          messageId,
          index: { gt: lastIndex },
        },
        orderBy: { index: "asc" },
        select: MessageChunk.Select,
      });

      for (const entity of entities) {
        const data = this.decrypt(entity);

        yield tracked(entity.index.toString(), {
          type: "chunk",
          chunk: data,
        } satisfies MessageChunk.ReceiveData);

        lastIndex = entity.index;
      }

      while (true) {
        const input = q.shift();
        if (input) {
          const { status } = input;
          if (status === "completed") {
            let usageLimit: UserUsageLimit | null = null;
            try {
              usageLimit = await this.service.userUsageLimit.get(userId);
            } catch (e) {
              console.error(
                "User usage limit getting failed. userId:",
                userId,
                " error:",
                e
              );
            }

            yield tracked("usageLimit", {
              type: "usageLimit",
              usageLimit,
            } satisfies MessageChunk.ReceiveData);

            return;
          }

          const { index } = input;
          if (index > lastIndex) {
            const entity = await this.service.db.messageChunk.findUniqueOrThrow(
              {
                where: {
                  message: { chat: { userId, deletedAt: null } },
                  messageId_index: { messageId, index },
                },
                select: MessageChunk.Select,
              }
            );

            const data = this.decrypt(entity);

            yield tracked(index.toString(), {
              type: "chunk",
              chunk: data,
            } satisfies MessageChunk.ReceiveData);

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

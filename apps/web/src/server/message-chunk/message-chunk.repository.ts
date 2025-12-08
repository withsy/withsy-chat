import type { MessageId, UserId } from "@/types/id";
import { MessageChunkSelect } from "@/types/message-chunk";
import type { Tx } from "../services/db";
import { getHardDeleteCutoffDate } from "../utils";

export class MessageChunkRepository {
  constructor(private readonly tx: Tx) {}

  async hardDeleteMessageChunks() {
    const cutoffDate = getHardDeleteCutoffDate(new Date());
    return await this.tx.messageChunk.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });
  }

  async findMessageChunks(input: {
    userId: UserId;
    messageId: MessageId;
    index: number;
  }) {
    const { userId, messageId, index } = input;

    const entities = await this.tx.messageChunk.findMany({
      where: {
        message: {
          chat: {
            userId,
            deletedAt: null,
          },
        },
        messageId,
        index: {
          gt: index,
        },
      },
      orderBy: { index: "asc" },
      select: MessageChunkSelect,
    });

    return entities;
  }
}

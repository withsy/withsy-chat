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
}

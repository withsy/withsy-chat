import type { Tx } from "../services/db";
import { getHardDeleteCutoffDate } from "../utils";

export class ChatRepo {
  constructor(private readonly tx: Tx) {}

  async findChatsToHardDelete() {
    const cutoffDate = getHardDeleteCutoffDate(new Date());
    return await this.tx.chat.findMany({
      where: { deletedAt: { not: null, lt: cutoffDate } },
      select: { id: true },
    });
  }

  async hardDeleteChats(chatIds: string[]) {
    return await this.tx.chat.deleteMany({
      where: { id: { in: chatIds } },
    });
  }
}

import { getHardDeleteCutoffDate } from "../utils";
import type { Db } from "./db";

export class ChatTaskHandler {
  constructor(private readonly db: Db) {}

  async onHardDeleteTask() {
    const cutoffDate = getHardDeleteCutoffDate(new Date());

    await this.db.$transaction(async (tx) => {
      const chatsToDelete = await tx.chat.findMany({
        where: { deletedAt: { not: null, lt: cutoffDate } },
        select: { id: true },
      });

      if (chatsToDelete.length === 0) return;

      const chatIds = chatsToDelete.map((x) => x.id);
      console.warn(
        `Preparing to delete ${chatIds.length}. chats: ${chatIds.join(", ")}`
      );

      const res = await tx.chat.deleteMany({
        where: { id: { in: chatIds } },
      });
      console.warn(`Successfully hard deleted ${res.count} chats.`);
    });
  }
}

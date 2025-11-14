import type { Db } from "./db";

export class MessageTaskHandler {
  constructor(private readonly db: Db) {}

  async onCleanupZombiesTask() {
    const res = await this.db.message.updateMany({
      where: {
        status: { in: ["pending", "processing"] },
        updatedAt: {
          lt: new Date(Date.now() - 10 * 60_000), // 10 minutes
        },
      },
      data: { status: "failed" },
    });

    if (res.count > 0)
      console.warn(`Marked ${res.count} zombie messages as failed.`);
  }
}

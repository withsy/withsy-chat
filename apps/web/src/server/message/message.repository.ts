import type { Tx } from "../services/db";

const _10_MINUTES_IN_MS = 10 * 60_000;

export class MessageRepo {
  constructor(private readonly tx: Tx) {}

  async cleanupZombieMessages() {
    const res = await this.tx.message.updateMany({
      where: {
        status: { in: ["pending", "processing"] },
        updatedAt: {
          lt: new Date(Date.now() - _10_MINUTES_IN_MS),
        },
      },
      data: { status: "failed" },
    });

    if (res.count > 0) {
      console.warn(`Marked ${res.count} zombie messages as failed.`);
    }
  }
}

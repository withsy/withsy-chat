import type { Tx } from "../services/db";

export class SupabaseActivityRepository {
  constructor(private readonly tx: Tx) {}

  async createSupabaseActivity() {
    return await this.tx.supabaseActivity.create({ select: { id: true } });
  }

  async findSupabaseActivity() {
    return await this.tx.supabaseActivity.findFirst({ select: { id: true } });
  }

  async updateSupabaseActivity(supabaseActivityId: number) {
    return await this.tx.supabaseActivity.update({
      where: { id: supabaseActivityId },
      data: { updatedAt: new Date() },
    });
  }
}

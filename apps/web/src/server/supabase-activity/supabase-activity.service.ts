import type { Db } from "../services/db";
import { SupabaseActivityRepository } from "./supabase-activity.repository";

export class SupabaseActivityService {
  constructor(private readonly db: Db) {}

  async updateSupabaseActivity() {
    await this.db.$transaction(async (tx) => {
      const supabaseActivityRepository = new SupabaseActivityRepository(tx);

      let supabaseActivity =
        await supabaseActivityRepository.findSupabaseActivity();
      if (!supabaseActivity) {
        supabaseActivity =
          await supabaseActivityRepository.createSupabaseActivity();
      }

      await supabaseActivityRepository.updateSupabaseActivity(
        supabaseActivity.id
      );
    });
  }
}

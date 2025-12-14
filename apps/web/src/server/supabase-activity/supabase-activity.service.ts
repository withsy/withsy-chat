import type { Db } from "../db/db";
import { SupabaseActivityRepo } from "./supabase-activity.repo";

export class SupabaseActivityService {
  constructor(private readonly db: Db) {}

  async refresh(): Promise<void> {
    const supabaseActivityRepo = new SupabaseActivityRepo(this.db);
    await supabaseActivityRepo.refresh();
  }
}

import type { Db } from "../db/db";
import type { SupabaseActivityModel } from "../generated/prisma/models";
import { SupabaseActivityRepo } from "./supabase-activity.repo";

export class SupabaseActivityService {
  constructor(private readonly db: Db) {}

  async createOrUpdate(): Promise<SupabaseActivityModel> {
    const supabaseActivityRepo = new SupabaseActivityRepo(this.db);
    return await supabaseActivityRepo.createOrUpdate();
  }
}

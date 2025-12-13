import type { Db } from "../db/db";
import type { SupabaseActivityModel } from "../generated/prisma/models";
import { SupabaseActivityRepository } from "./supabase-activity.repository";

export class SupabaseActivityService {
  constructor(private readonly db: Db) {}

  async upsert(): Promise<SupabaseActivityModel> {
    const supabaseActivityRepository = new SupabaseActivityRepository(this.db);
    return await supabaseActivityRepository.upsert();
  }
}

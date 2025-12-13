import camelcaseKeys from "camelcase-keys";
import type { Tx } from "../db/db";
import type { SupabaseActivityModel } from "../generated/prisma/models";

export class SupabaseActivityRepository {
  constructor(private readonly tx: Tx) {}

  async upsert(): Promise<SupabaseActivityModel> {
    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
INSERT INTO supabase_activities (
  id, updated_at
) VALUES (
  ${1n}, ${new Date()}
) ON CONFLICT (
  id
) DO UPDATE SET
  updated_at = EXCLUDED.updated_at
RETURNING *;
`;

    const entity = camelcaseKeys(rows[0]);
    return entity as SupabaseActivityModel;
  }
}

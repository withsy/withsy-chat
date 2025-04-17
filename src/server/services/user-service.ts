import { UpdateUserPrefs, type UserId } from "@/types/user";
import { sql } from "kysely";
import type { ServiceRegistry } from "../service-registry";

export class UserService {
  constructor(private readonly service: ServiceRegistry) {}

  async prefs(userId: UserId) {
    const res = await this.service.db
      .selectFrom("users as u")
      .where("u.id", "=", userId)
      .select(["u.preferences"])
      .executeTakeFirstOrThrow();
    return res;
  }

  async updatePrefs(userId: UserId, input: UpdateUserPrefs) {
    const patch = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    );

    const res = await this.service.db.transaction().execute(async (tx) => {
      await tx
        .selectFrom("users as u")
        .where("u.id", "=", userId)
        .forUpdate("u")
        .executeTakeFirstOrThrow();
      const row = await tx
        .updateTable("users as u")
        .where("u.id", "=", userId)
        .set({ preferences: sql`preferences || ${patch} ::jsonb` })
        .returning(["u.preferences"])
        .executeTakeFirstOrThrow();
      return row;
    });

    return res;
  }
}

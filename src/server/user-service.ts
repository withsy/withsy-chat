import { User, type UpdateUserPrefs, type UserId } from "@/types/user";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import type { Registry } from "./global";

export const USER_NOT_FOUND_ERROR = new TRPCError({
  code: "NOT_FOUND",
  message: "User not found",
});

export class UserService {
  constructor(private readonly r: Registry) {}

  async me(userId: UserId): Promise<User> {
    const user = await this.r
      .get("db")
      .selectFrom("users")
      .where("id", "=", userId)
      .selectAll()
      .executeTakeFirstOrThrow(() => USER_NOT_FOUND_ERROR);
    return await User.parseAsync(user);
  }

  async updatePrefs(userId: UserId, input: UpdateUserPrefs): Promise<User> {
    const patch = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value != null)
    );
    const user = await this.r
      .get("db")
      .updateTable("users")
      .set({
        preferences: sql`preferences || ${patch}::jsonb`,
      })
      .where("id", "=", userId)
      .returningAll()
      .executeTakeFirstOrThrow(() => USER_NOT_FOUND_ERROR);
    return await User.parseAsync(user);
  }

  async getSeedUserId_DEV() {
    return await this.r
      .get("db")
      .selectFrom("users")
      .orderBy("createdAt", "asc")
      .limit(1)
      .select("id")
      .executeTakeFirstOrThrow(() => USER_NOT_FOUND_ERROR);
  }
}

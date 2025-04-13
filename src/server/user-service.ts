import { User, type UpdateUserPrefs, type UserId } from "@/types/user";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import type { ServiceMap } from "./global";

export const USER_NOT_FOUND_ERROR = new TRPCError({
  code: "NOT_FOUND",
  message: "User not found",
});

export class UserService {
  constructor(private readonly s: ServiceMap) {}

  async me(userId: UserId): Promise<User> {
    const user = await this.s.db
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
    const user = await this.s.db
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
    return await this.s.db
      .selectFrom("users")
      .orderBy("createdAt", "asc")
      .limit(1)
      .select("id")
      .executeTakeFirstOrThrow(() => USER_NOT_FOUND_ERROR);
  }
}

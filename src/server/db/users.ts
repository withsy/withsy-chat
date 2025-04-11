import {
  User,
  UserId,
  UserPreferences,
  type UpdateUserPrefs,
} from "@/types/user";
import { TRPCError } from "@trpc/server";
import { sql } from "@ts-safeql/sql-tag";
import { Pool } from "./core";

export class Users {
  #pool: Pool;

  constructor(pool: Pool) {
    this.#pool = pool;
  }

  async me(userId: UserId): Promise<User> {
    const rs = await this.#pool.queryable.query<
      {
        id: string;
        preferences: UserPreferences;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >(sql`
      SELECT * FROM users WHERE id = ${userId} ::uuid;
    `);
    if (rs.length === 0)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    const user = rs[0];
    return user;
  }

  async updateUserPrefs(userId: UserId, input: UpdateUserPrefs): Promise<User> {
    const { wideView, largeText, enableTabs, showIndex, enterToSend } = input;
    return await this.#pool.transaction(async (qr) => {
      const rs = await qr.query<
        { id: string; preferences: UserPreferences }[]
      >(sql`
        SELECT id, preferences
        FROM users
        WHERE id = ${userId} ::uuid
        FOR UPDATE;
      `);
      if (rs.length === 0)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const partial = rs[0];
      if (wideView != null) partial.preferences.wideView = wideView;
      if (largeText != null) partial.preferences.largeText = largeText;
      if (enableTabs != null) partial.preferences.enableTabs = enableTabs;
      if (showIndex != null) partial.preferences.showIndex = showIndex;
      if (enterToSend != null) partial.preferences.enterToSend = enterToSend;

      const updated = await qr.query<
        {
          id: string;
          preferences: UserPreferences;
          createdAt: Date;
          updatedAt: Date;
        }[]
      >(sql`
        UPDATE users
        SET preferences = ${partial.preferences as unknown} ::jsonb
        WHERE id = ${partial.id} ::uuid
        RETURNING *;
      `);
      const user = updated[0];
      return user;
    });
  }

  async getSeedUserId_DEV() {
    const rs = await this.#pool.queryable.query<{ id: string }[]>(sql`
      SELECT id FROM users 
      ORDER BY created_at ASC
      LIMIT 1;
    `);
    const userId = rs[0].id;
    return { userId };
  }
}

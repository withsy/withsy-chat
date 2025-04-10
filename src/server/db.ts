import { sql } from "@ts-safeql/sql-tag";
import "dotenv/config";
import pg from "pg";
import { Chats } from "./db/chats";
import { Users } from "./db/users";

export const db = {
  user: new Users(),
  chat: new Chats(),
};

async function test() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();
  // client.query<{ id: number }>(sql`SELECT id FROM books;`);
}

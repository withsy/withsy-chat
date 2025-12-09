import { Pool } from "pg";

export function createPgPool(): [
  pgPool: Pool,
  closePgPool: () => Promise<void>
] {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    throw new Error("Invalid DATABASE_URL.");
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 5,
  });

  const onError = (e: unknown) => {
    console.error("Postgres error occurred. error:", e);
  };
  pool.on("error", onError);
  pool.on("connect", (client) => {
    client.on("error", onError);
  });

  return [pool, () => pool.end()];
}

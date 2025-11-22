import { runMigrations } from "graphile-worker";
import { Pool } from "pg";

main();

async function main() {
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  });

  await runMigrations({ pgPool });
}

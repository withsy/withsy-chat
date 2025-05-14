import type { PgEventInput, PgEventKey, PgEventSchema } from "@/types/task";
import type { MaybePromise } from "@trpc/server/unstable-core-do-not-import";
import type { ConnectionOptions } from "node:tls";
import { type Notification, Pool } from "pg";
import type { ServiceRegistry } from "../service-registry";

export function createPgPool(s: ServiceRegistry): Pool {
  let ssl: ConnectionOptions | undefined = undefined;

  if (s.env.nodeEnv === "production") {
    if (!s.env.rdsCaCert) throw new Error("Please set RDS_CA_CERT env var.");
    ssl = {
      rejectUnauthorized: true,
      ca: [s.env.rdsCaCert],
    };
  }

  const pool = new Pool({
    connectionString: s.env.databaseUrl,
    ssl,
  });

  const onError = (e: unknown) => {
    console.error("Postgres error occurred. error:", e);
  };
  pool.on("error", onError);
  pool.on("connect", (client) => {
    client.on("error", onError);
  });

  process.on("SIGTERM", async () => {
    await pool.end();
  });

  return pool;
}

export async function notify<K extends PgEventKey>(
  pool: Pool,
  key: K,
  input: PgEventInput<K>
) {
  const payload = JSON.stringify(input).replace(/'/g, "''");
  await pool.query(`NOTIFY ${key}, '${payload}'`);
}

export async function listen<K extends PgEventKey>(
  pool: Pool,
  key: K,
  schema: PgEventSchema<K>,
  onNotification: (input: PgEventInput<K>) => MaybePromise<void>
): Promise<() => Promise<void>> {
  const handler = async (noti: Notification) => {
    try {
      if (noti.channel !== key) return;
      const input = schema.parse(JSON.parse(noti.payload ?? "{}"));
      await onNotification(input);
    } catch (e) {
      console.error(`PgEvent ${key} on notification failed. error:`, e);
    }
  };

  const client = await pool.connect();

  let released = false;
  const unlisten = async () => {
    if (released) return;
    released = true;

    try {
      client.off("notification", handler);
    } catch (e) {
      console.warn("off notification failed:", e);
    }

    try {
      await client.query(`UNLISTEN ${key}`);
    } catch (e) {
      console.warn("UNLISTEN failed:", e);
    }

    try {
      client.release();
    } catch (e) {
      console.warn("Client release failed:", e);
    }
  };

  client.on("notification", handler);
  try {
    await client.query(`LISTEN ${key}`);
  } catch (e) {
    await unlisten();
    throw e;
  }

  return unlisten;
}

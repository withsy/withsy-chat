import type { MaybePromise } from "@/types/common";
import { sql } from "@ts-safeql/sql-tag";
import camelcaseKeys from "camelcase-keys";
import pg, { ClientBase, type PoolConfig, type QueryConfig } from "pg";
import { Chats } from "./chats";
import { Users } from "./users";

export type Queryable = {
  query: <Rs extends Record<string, any>[], Ps extends any[] = any[]>(
    queryConfig: QueryConfig<Ps>
  ) => Promise<Rs>;
};

function queryable(client: Pick<ClientBase, "query">): Queryable {
  const qr: Queryable = {
    async query<Rs extends Record<string, any>[], Ps extends any[] = any[]>(
      queryConfig: QueryConfig<Ps>
    ): Promise<Rs> {
      const result = await client.query(queryConfig);
      const rows = result.rows.map((v) => camelcaseKeys(v, { deep: true }));
      return rows as Rs;
    },
  };
  return qr;
}

export class Pool {
  #impl: pg.Pool;

  constructor(config?: PoolConfig) {
    this.#impl = new pg.Pool(config);
  }

  get queryable(): Queryable {
    return queryable(this.#impl);
  }

  async transaction<R>(fn: (qr: Queryable) => MaybePromise<R>): Promise<R> {
    const poolClient = await this.#impl.connect();
    const qr = queryable(poolClient);
    try {
      await qr.query(sql`BEGIN`);
      const result = await fn(qr);
      await qr.query(sql`COMMIT`);
      return result;
    } catch (e) {
      await qr.query(sql`ROLLBACK`);
      throw e;
    } finally {
      poolClient.release();
    }
  }
}

export class Db {
  #pool: Pool;
  users: Users;
  chats: Chats;

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("Please set DATABASE_URL env.");
    }
    this.#pool = new Pool({
      connectionString: dbUrl,
    });

    this.users = new Users(this.#pool);
    this.chats = new Chats(this.#pool);
  }
}

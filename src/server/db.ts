import {
  CamelCasePlugin,
  Kysely,
  PostgresDialect,
  type Transaction,
} from "kysely";
import type { DB } from "kysely-codegen";
import type { Pool } from "pg";

export type Db = Kysely<DB>;
export type Tx = Transaction<DB>;

export function createDb(pool: Pool) {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool,
    }),
    plugins: [new CamelCasePlugin()],
  });
}

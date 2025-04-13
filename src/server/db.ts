import {
  CamelCasePlugin,
  Kysely,
  PostgresDialect,
  type Transaction,
} from "kysely";
import type { DB } from "kysely-codegen";
import type { ServiceMap } from "./global";

export type Db = Kysely<DB>;
export type Tx = Transaction<DB>;

export function createDb(s: ServiceMap) {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: s.pool,
    }),
    plugins: [new CamelCasePlugin()],
  });
}

import {
  CamelCasePlugin,
  Kysely,
  PostgresDialect,
  type Transaction,
} from "kysely";
import type { DB } from "kysely-codegen";
import type { Registry } from "./global";

export type Db = Kysely<DB>;
export type Tx = Transaction<DB>;

export function createDb(r: Registry) {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: r.get("pool"),
    }),
    plugins: [new CamelCasePlugin()],
  });
}

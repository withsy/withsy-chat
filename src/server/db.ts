import {
  CamelCasePlugin,
  Kysely,
  PostgresDialect,
  type Transaction,
} from "kysely";
import type { DB } from "kysely-codegen";
import type { ServiceRegistry } from "./global";

export type Db = Kysely<DB>;
export type Tx = Transaction<DB>;

export function createDb(s: ServiceRegistry) {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: s.get("pool"),
    }),
    plugins: [new CamelCasePlugin()],
  });
}

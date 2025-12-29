import { Injectable, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { ConfigService } from "../config/config-service.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { inspect } from "../utils.js";
import { PgPoolService } from "./pg-pool-service.js";

const MODEL_SET = new Set<string>(["Chat", "User", "UserPrompt"]);

const OPERATION_CONFIG = new Map<string, { include: boolean }>([
  [
    "aggregate",
    {
      include: false,
    },
  ],
  [
    "count",
    {
      include: false,
    },
  ],
  [
    "findFirst",
    {
      include: true,
    },
  ],
  [
    "findFirstOrThrow",
    {
      include: true,
    },
  ],
  [
    "findMany",
    {
      include: true,
    },
  ],
  [
    "findUnique",
    {
      include: true,
    },
  ],
  [
    "findUniqueOrThrow",
    {
      include: true,
    },
  ],
  [
    "groupBy",
    {
      include: false,
    },
  ],
  [
    "update",
    {
      include: true,
    },
  ],
  [
    "updateMany",
    {
      include: false,
    },
  ],
  [
    "updateManyAndReturn",
    {
      include: true,
    },
  ],
  [
    "upsert",
    {
      include: true,
    },
  ],
]);

@Injectable()
export class DbService {
  readonly #logger = new Logger(DbService.name);
  readonly db;

  constructor(configService: ConfigService, pgPoolService: PgPoolService) {
    const adapter = new PrismaPg(pgPoolService.pool);
    const client = new PrismaClient({
      adapter,
      log:
        configService.nodeEnv === "development"
          ? [
              { emit: "event", level: "query" },
              { emit: "event", level: "info" },
              { emit: "event", level: "warn" },
              { emit: "event", level: "error" },
            ]
          : [{ emit: "event", level: "error" }],
    });

    client.$on("query", (ev) => {
      this.#logger.log(inspect(ev));
    });
    client.$on("info", (ev) => {
      this.#logger.log(inspect(ev));
    });
    client.$on("warn", (ev) => {
      this.#logger.warn(inspect(ev));
    });
    client.$on("error", (ev) => {
      this.#logger.error(inspect(ev));
    });

    this.db = client.$extends({
      name: "softDelete",
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args, query }) => {
            if (!MODEL_SET.has(model)) {
              return await query(args);
            }

            const opConfig = OPERATION_CONFIG.get(operation);
            if (!opConfig) {
              return await query(args);
            }

            if ("where" in args) {
              args.where = {
                ...args.where,
                deletedAt: null,
              };
            } else {
              Reflect.set(args, "where", {
                deletedAt: null,
              });
            }
          },
        },
      },
    });
  }
}

export type Tx = Parameters<Parameters<DbService["db"]["$transaction"]>[0]>[0];

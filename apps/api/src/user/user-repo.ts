import { Logger } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import camelcaseKeys from "camelcase-keys";
import { v4 } from "uuid";
import { Tx } from "../db/db-service";
import type { UserModel } from "../generated/prisma/models";
import {
  PartialUserPreferences,
  UserGet,
  UserId,
  UserUpdate,
} from "./user-schemas";

export class UserRepo {
  private readonly logger = new Logger(UserRepo.name);

  constructor(private readonly tx: Tx) {}

  async get(input: UserGet): Promise<UserModel> {
    const { userId } = input;

    const entity = await this.tx.user.findUniqueOrThrow({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    return entity;
  }

  async update(userId: UserId, input: UserUpdate): Promise<UserModel> {
    const { preferences = {}, ..._restInput } = input;

    const filteredPreferences = Object.fromEntries(
      Object.entries(preferences).filter(([_, v]) => v !== undefined),
    );

    PartialUserPreferences.parse(filteredPreferences);

    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
UPDATE users
SET preferences = preferences || ${filteredPreferences}::jsonb
WHERE id = ${userId}::uuid
  AND deleted_at IS NULL
RETURNING *`;

    if (rows.length === 0) {
      const message = "User not found.";
      this.logger.error({ message, userId });

      throw new TRPCError({
        code: "NOT_FOUND",
        message,
      });
    }

    const entity = camelcaseKeys(rows[0]);
    return entity as UserModel;
  }

  async create(): Promise<UserModel> {
    const entity = await this.tx.user.create({
      data: {
        id: v4(),
      },
    });

    return entity;
  }
}

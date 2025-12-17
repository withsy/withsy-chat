import { Logger } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { Tx } from "src/db/db.host";
import { DataError } from "src/error";
import { v4 } from "uuid";
import type { UserModel } from "../generated/prisma/models";
import {
  UserId,
  UserPreferencesRaw,
  UserUpdatePreferences,
} from "./user-schemas";

export class UserRepo {
  private readonly logger = new Logger(UserRepo.name);

  constructor(private readonly tx: Tx) {}

  //   async get(input: { userId: UserId }): Promise<UserModel> {
  //     const { userId } = input;

  //     return await this.tx.user.findUniqueOrThrow({
  //       where: {
  //         id: userId,
  //       },
  //     });
  //   }

  //   async update(
  //     userId: UserId,
  //     input: {
  //       aiLanguage?: string;
  //       timezone?: string;
  //     }
  //   ): Promise<UserModel> {
  //     const { aiLanguage, timezone } = input;

  //     return await this.tx.user.update({
  //       where: {
  //         id: userId,
  //       },
  //       data: {
  //         aiLanguage,
  //         timezone,
  //       },
  //     });
  //   }

  async getPreferences(userId: UserId): Promise<UserPreferencesRaw> {
    const { preferences } = await this.tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        preferences: true,
      },
    });

    return preferences as UserPreferencesRaw;
  }

  async updatePreferences(
    userId: UserId,
    input: UserUpdatePreferences
  ): Promise<UserPreferencesRaw> {
    const patch = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value != null)
    );

    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
  UPDATE users
  SET
    preferences = preferences || ${patch}::jsonb
  WHERE
    id = ${userId}::uuid
  RETURNING *`;

    if (rows.length === 0) {
      const message = "User not found.";
      this.logger.error({ message, userId });

      throw new TRPCError({
        code: "NOT_FOUND",
        message,
      });
    }

    const { preferences } = rows[0];
    return preferences as UserPreferencesRaw;
  }

  async create(input: {
    nameEncrypted: string;
    emailEncrypted: string;
    imageUrlEncrypted: string;
  }): Promise<UserModel> {
    const { nameEncrypted, emailEncrypted, imageUrlEncrypted } = input;

    const user = await this.tx.user.create({
      data: {
        id: v4(),
        nameEncrypted,
        emailEncrypted,
        imageUrlEncrypted,
      },
    });

    return user;
  }
}

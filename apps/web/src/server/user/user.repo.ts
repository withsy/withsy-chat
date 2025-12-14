import {
  UserUpdatePreferencesOutput,
  type UserId,
  type UserUpdatePreferences,
} from "@/types/user";
import { TRPCError } from "@trpc/server";
import { v4 } from "uuid";
import type { Tx } from "../db/db";
import { DataError } from "../error";
import type { UserModel } from "../generated/prisma/models";

export class UserRepo {
  constructor(private readonly tx: Tx) {}

  async get(input: { userId: UserId }): Promise<UserModel> {
    const { userId } = input;

    return await this.tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
  }

  async update(
    userId: UserId,
    input: {
      aiLanguage?: string;
      timezone?: string;
    }
  ): Promise<UserModel> {
    const { aiLanguage, timezone } = input;

    return await this.tx.user.update({
      where: {
        id: userId,
      },
      data: {
        aiLanguage,
        timezone,
      },
    });
  }

  async updatePreferences(
    userId: UserId,
    input: UserUpdatePreferences
  ): Promise<UserUpdatePreferencesOutput> {
    const patch = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    );

    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
UPDATE users 
SET
  preferences = preferences || ${patch}::jsonb 
WHERE
  id = ${userId}::uuid
RETURNING *`;

    if (rows.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found.",
        cause: new DataError({
          userId,
        }),
      });
    }

    const { preferences } = rows[0];
    return preferences as UserUpdatePreferencesOutput;
  }

  async create(input: {
    nameEncrypted: string;
    emailEncrypted: string;
    imageUrlEncrypted: string;
  }): Promise<UserModel> {
    const { nameEncrypted, emailEncrypted, imageUrlEncrypted } = input;

    const id = v4();
    const entity = await this.tx.user.create({
      data: {
        id,
        nameEncrypted,
        emailEncrypted,
        imageUrlEncrypted,
      },
    });

    return entity;
  }
}

import {
  UserUpdatePreferencesOutput,
  type UserId,
  type UserUpdatePreferences,
} from "@/types/user";
import { TRPCError } from "@trpc/server";
import type { Tx } from "../db/db";
import type { UserModel } from "../generated/prisma/models";

export class UserRepository {
  constructor(private readonly tx: Tx) {}

  async getUser(input: { userId: UserId }): Promise<UserModel> {
    const { userId } = input;

    return await this.tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
  }

  async updateUser(
    userId: UserId,
    input: {
      aiLanguage?: string;
      timezone?: string;
    }
  ) {
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

  async updateUserPreferences(
    userId: UserId,
    input: UserUpdatePreferences
  ): Promise<UserUpdatePreferencesOutput> {
    const patch = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    );

    const rows = await this.tx.$queryRaw<{ preferences?: unknown }[]>`
          UPDATE users 
          SET preferences = preferences || ${patch}::jsonb 
          WHERE id = ${userId}::uuid
          RETURNING preferences`;

    if (rows.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found.",
      });
    }

    return UserUpdatePreferencesOutput.parse(rows[0]);
  }

  async createUser(input: {
    nameEncrypted: string;
    emailEncrypted: string;
    imageUrlEncrypted: string;
  }): Promise<UserModel> {
    const { nameEncrypted, emailEncrypted, imageUrlEncrypted } = input;

    const userEntity = await this.tx.user.create({
      data: {
        nameEncrypted,
        emailEncrypted,
        imageUrlEncrypted,
      },
    });

    return userEntity;
  }
}

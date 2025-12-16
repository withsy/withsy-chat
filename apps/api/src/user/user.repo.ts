import { Tx } from "src/db/db.host";
import { v4 } from "uuid";
import type { UserModel } from "../generated/prisma/models";

export class UserRepo {
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

  //   async updatePreferences(
  //     userId: UserId,
  //     input: UserUpdatePreferences
  //   ): Promise<UserUpdatePreferencesOutput> {
  //     const patch = Object.fromEntries(
  //       Object.entries(input).filter(([_, value]) => value !== undefined)
  //     );

  //     const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
  // UPDATE users
  // SET
  //   preferences = preferences || ${patch}::jsonb
  // WHERE
  //   id = ${userId}::uuid
  // RETURNING *`;

  //     if (rows.length === 0) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "User not found.",
  //         cause: new DataError({
  //           userId,
  //         }),
  //       });
  //     }

  //     const { preferences } = rows[0];
  //     return preferences as UserUpdatePreferencesOutput;
  //   }

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

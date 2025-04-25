import {
  User,
  UserSelect,
  UserUpdatePrefs,
  type UserEnsure,
  type UserId,
} from "@/types/user";
import { TRPCError } from "@trpc/server";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserService {
  constructor(private readonly service: ServiceRegistry) {}

  async get(userId: UserId): Promise<User> {
    const res = await this.service.db.user.findUniqueOrThrow({
      where: { id: userId },
      select: UserSelect,
    });

    return User.parse(res);
  }

  async ensure(userId: UserId, input: UserEnsure) {
    const { language, timezone } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: UserSelect,
      });

      const updated = tx.user.update({
        where: { id: userId },
        data: {
          language: user.language.length === 0 ? language : undefined,
          timezone: user.timezone.length === 0 ? timezone : undefined,
        },
        select: UserSelect,
      });

      return updated;
    });

    return res;
  }

  async updatePrefs(userId: UserId, input: UserUpdatePrefs) {
    const patch = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    );

    const res = await this.service.db.$transaction(async (tx) => {
      {
        const affected =
          await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} ::uuid FOR UPDATE`;
        if (affected === 0)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
      }
      {
        const affected = await tx.$executeRaw`
          UPDATE users 
          SET preferences = preferences || ${patch} ::jsonb 
          WHERE id = ${userId} ::uuid`;
        if (affected === 0)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
      }

      const user = tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { preferences: true },
      });

      return user;
    });

    return res;
  }

  static async create(
    tx: Tx,
    input: { name?: string; email?: string; image?: string }
  ) {
    const { name, email, image } = input;
    const res = await tx.user.create({
      data: {
        name,
        email,
        image,
      },
      select: {
        id: true,
      },
    });

    return res;
  }
}

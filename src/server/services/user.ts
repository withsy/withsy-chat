import { isValidAiLanguage } from "@/types/languages";
import {
  User,
  UserSelect,
  UserUpdate,
  UserUpdatePrefs,
  type UserEnsure,
  type UserId,
} from "@/types/user";
import { TRPCError } from "@trpc/server";
import type { ServiceRegistry } from "../service-registry";
import { isValidTimezone } from "../utils";
import type { Tx } from "./db";

const FALLBACK_TIMEZONE = "UTC";
const FALLBACK_AI_LANGUAGE = "en";

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
    const res = await this.service.db.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: UserSelect,
      });

      let timezone: string | undefined = undefined;
      if (user.timezone.length === 0) {
        timezone =
          input.timezone && isValidTimezone(input.timezone)
            ? input.timezone
            : FALLBACK_TIMEZONE;
      }

      let aiLanguage: string | undefined = undefined;
      if (user.aiLanguage.length === 0) {
        aiLanguage =
          input.aiLanguage && isValidAiLanguage(input.aiLanguage)
            ? input.aiLanguage
            : FALLBACK_AI_LANGUAGE;
      }

      const updated = tx.user.update({
        where: { id: userId },
        data: {
          aiLanguage,
          timezone,
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

  async update(userId: UserId, input: UserUpdate) {
    const { aiLanguage, timezone } = input;
    if (aiLanguage && !isValidAiLanguage(aiLanguage))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid aiLanguage.",
      });

    if (timezone && !isValidTimezone(timezone))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid timezone.",
      });

    const res = await this.service.db.user.update({
      where: { id: userId },
      data: {
        aiLanguage,
        timezone,
      },
      select: UserSelect,
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

  static async getForGratitudeJournal(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const res = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        aiLanguage: true,
      },
    });

    return res;
  }

  static async getTimezone(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const { timezone } = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { timezone: true },
    });

    if (isValidTimezone(timezone)) return timezone;
    return FALLBACK_TIMEZONE;
  }

  static async getAiLanguage(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const { aiLanguage } = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { aiLanguage: true },
    });

    if (isValidAiLanguage(aiLanguage)) return aiLanguage;
    return FALLBACK_AI_LANGUAGE;
  }
}

import type { UserId } from "@/types/id";
import { isValidAiLanguage } from "@/types/languages";
import * as User from "@/types/user";
import { TRPCError } from "@trpc/server";
import type { ServiceRegistry } from "../service-registry";
import { isValidTimezone } from "../utils";
import type { Tx } from "./db";

const FALLBACK_TIMEZONE = "UTC";
const FALLBACK_AI_LANGUAGE = "en";

export class UserService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(entity: User.Entity): User.Data {
    const name = this.service.encryption.decrypt(entity.nameEncrypted);
    const email = this.service.encryption.decrypt(entity.emailEncrypted);
    const imageUrl = this.service.encryption.decrypt(entity.imageUrlEncrypted);
    const preferences = User.Prefs.parse(entity.preferences);
    const data = {
      id: entity.id,
      name,
      email,
      imageUrl,
      aiLanguage: entity.aiLanguage,
      timezone: entity.timezone,
      preferences,
    } satisfies User.Data;
    return data;
  }

  async get(userId: UserId): Promise<User.Data> {
    const entity = await this.service.db.user.findUniqueOrThrow({
      where: { id: userId },
      select: User.Select,
    });

    const data = this.decrypt(entity);
    return data;
  }

  async ensure(userId: UserId, input: User.Ensure): Promise<User.Data> {
    const entity = await this.service.db.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: User.Select,
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
        select: User.Select,
      });

      return updated;
    });

    const data = this.decrypt(entity);
    return data;
  }

  async updatePrefs(
    userId: UserId,
    input: User.UpdatePrefs
  ): Promise<User.UpdatePrefsOutput> {
    const patch = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    );

    const entity = await this.service.db.$transaction(async (tx) => {
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

      const entity = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { preferences: true },
      });

      return entity;
    });

    const data = User.UpdatePrefsOutput.parse(entity);
    return data;
  }

  async update(userId: UserId, input: User.Update): Promise<User.Data> {
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

    const entity = await this.service.db.user.update({
      where: { id: userId },
      data: {
        aiLanguage,
        timezone,
      },
      select: User.Select,
    });

    const data = this.decrypt(entity);
    return data;
  }

  static async create(
    tx: Tx,
    input: {
      nameEncrypted: string;
      emailEncrypted: string;
      imageUrlEncrypted: string;
    }
  ) {
    const { nameEncrypted, emailEncrypted, imageUrlEncrypted } = input;
    const entity = await tx.user.create({
      data: {
        nameEncrypted,
        emailEncrypted,
        imageUrlEncrypted,
      },
      select: { id: true },
    });

    return entity;
  }

  async getForGratitudeJournal(input: { userId: UserId }) {
    const { userId } = input;
    const entity = await this.service.db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        nameEncrypted: true,
        aiLanguage: true,
      },
    });

    return entity;
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

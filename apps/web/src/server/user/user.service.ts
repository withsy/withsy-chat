import { isValidAiLanguage } from "@/types/languages";
import {
  UserData,
  UserEnsure,
  UserId,
  UserUpdate,
  UserUpdatePreferences,
  UserUpdatePreferencesOutput,
} from "@/types/user";
import { TRPCError } from "@trpc/server";
import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import { UserDecryptor } from "../user/user.decryptor";
import { UserRepo } from "../user/user.repo";
import { isValidTimezone } from "../utils";

const FALLBACK_TIMEZONE = "UTC";
const FALLBACK_AI_LANGUAGE = "en";

export class UserService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db
  ) {}

  async get(userId: UserId): Promise<UserData> {
    const userRepo = new UserRepo(this.db);
    const entity = await userRepo.get({ userId });

    const userDecryptor = new UserDecryptor(this.encryptionService);
    const data = userDecryptor.decrypt(entity);

    return data;
  }

  async ensure(userId: UserId, input: UserEnsure): Promise<UserData> {
    const entity = await this.db.$transaction(async (tx) => {
      const userRepo = new UserRepo(tx);
      const entity = await userRepo.get({ userId });

      let timezone: string | undefined = undefined;
      if (entity.timezone.length === 0) {
        timezone =
          input.timezone && isValidTimezone(input.timezone)
            ? input.timezone
            : FALLBACK_TIMEZONE;
      }

      let aiLanguage: string | undefined = undefined;
      if (entity.aiLanguage.length === 0) {
        aiLanguage =
          input.aiLanguage && isValidAiLanguage(input.aiLanguage)
            ? input.aiLanguage
            : FALLBACK_AI_LANGUAGE;
      }

      return await userRepo.update(userId, {
        aiLanguage,
        timezone,
      });
    });

    const userDecryptor = new UserDecryptor(this.encryptionService);
    const data = userDecryptor.decrypt(entity);

    return data;
  }

  async updatePreferences(
    userId: UserId,
    input: UserUpdatePreferences
  ): Promise<UserUpdatePreferencesOutput> {
    const userRepo = new UserRepo(this.db);
    const output = await userRepo.updatePreferences(userId, input);

    return output;
  }

  async update(userId: UserId, input: UserUpdate): Promise<UserData> {
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

    const userRepo = new UserRepo(this.db);
    const entity = await userRepo.update(userId, {
      aiLanguage,
      timezone,
    });

    const userDecryptor = new UserDecryptor(this.encryptionService);
    const data = userDecryptor.decrypt(entity);

    return data;
  }
}

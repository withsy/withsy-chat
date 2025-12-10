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
import { UserRepository } from "../user/user.repository";
import { isValidTimezone } from "../utils";

const FALLBACK_TIMEZONE = "UTC";
const FALLBACK_AI_LANGUAGE = "en";

export class UserService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db
  ) {}

  async get(userId: UserId): Promise<UserData> {
    const userRepository = new UserRepository(this.db);
    const userEntity = await userRepository.get({ userId });

    const userDecryptor = new UserDecryptor(this.encryptionService);
    const userData = userDecryptor.decrypt(userEntity);
    return userData;
  }

  async ensure(userId: UserId, input: UserEnsure): Promise<UserData> {
    const userEntity = await this.db.$transaction(async (tx) => {
      const userRepository = new UserRepository(tx);
      const userEntity = await userRepository.get({ userId });

      let timezone: string | undefined = undefined;
      if (userEntity.timezone.length === 0) {
        timezone =
          input.timezone && isValidTimezone(input.timezone)
            ? input.timezone
            : FALLBACK_TIMEZONE;
      }

      let aiLanguage: string | undefined = undefined;
      if (userEntity.aiLanguage.length === 0) {
        aiLanguage =
          input.aiLanguage && isValidAiLanguage(input.aiLanguage)
            ? input.aiLanguage
            : FALLBACK_AI_LANGUAGE;
      }

      return await userRepository.update(userId, {
        aiLanguage,
        timezone,
      });
    });

    const userDecryptor = new UserDecryptor(this.encryptionService);
    const userData = userDecryptor.decrypt(userEntity);
    return userData;
  }

  async updatePreferences(
    userId: UserId,
    input: UserUpdatePreferences
  ): Promise<UserUpdatePreferencesOutput> {
    const userRepository = new UserRepository(this.db);
    return await userRepository.updatePreferences(userId, input);
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

    const userRepository = new UserRepository(this.db);
    const userEntity = await userRepository.update(userId, {
      aiLanguage,
      timezone,
    });

    const userDecryptor = new UserDecryptor(this.encryptionService);
    const userData = userDecryptor.decrypt(userEntity);
    return userData;
  }
}

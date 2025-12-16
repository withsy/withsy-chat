import { Injectable } from "@nestjs/common";
import { DbHost } from "src/db/db.host";
import { EncryptionService } from "src/encryption/encryption.service";
import { IdempotencyKeyRepo } from "src/idempotency-key/idempotency-key-repo";
import { RefreshTokenService } from "src/refresh-token/refresh-token.service";
import { UserLinkAccountRepo } from "src/user-link-account/user-link-account-repo";
import {
  UserId,
  UserLogin,
  UserLoginOutput,
  UserUpdatePreferences,
  UserUpdatePreferencesOutput,
} from "./user-schemas";
import { UserRepo } from "./user.repo";

@Injectable()
export class UserService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly dbHost: DbHost,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async login(input: UserLogin): Promise<UserLoginOutput> {
    const { idempotencyKey, provider, providerAccountId, refreshToken } = input;
    const name = input.name ?? "";
    const email = input.email ?? "";
    const imageUrl = input.imageUrl ?? "";

    if (refreshToken) {
      await this.refreshTokenService.save({
        provider,
        providerAccountId,
        refreshToken,
      });
    }

    const nameEncrypted = this.encryptionService.encrypt(name);
    const emailEncrypted = this.encryptionService.encrypt(email);
    const imageUrlEncrypted = this.encryptionService.encrypt(imageUrl);

    return await this.dbHost.db.$transaction(async (tx) => {
      const idempotencyKeyRepo = new IdempotencyKeyRepo(tx);
      await idempotencyKeyRepo.create({
        idempotencyKey,
      });

      const userLinkAccountRepo = new UserLinkAccountRepo(tx);
      let userLinkAccount = await userLinkAccountRepo.getByProviderData({
        provider,
        providerAccountId,
      });

      if (!userLinkAccount) {
        const userRepo = new UserRepo(tx);
        const user = await userRepo.create({
          nameEncrypted,
          emailEncrypted,
          imageUrlEncrypted,
        });

        userLinkAccount = await userLinkAccountRepo.create({
          userId: user.id,
          provider,
          providerAccountId,
        });
      }

      const { userId } = userLinkAccount;

      return {
        userId,
      };
    });
  }

  async updatePreferences(
    userId: UserId,
    input: UserUpdatePreferences
  ): Promise<UserUpdatePreferencesOutput> {
    const userRepo = new UserRepo(this.dbHost.db);
    const output = await userRepo.updatePreferences(userId, input);

    return output;
  }

  // async get(userId: UserId): Promise<UserData> {
  //   const userRepo = new UserRepo(this.db);
  //   const entity = await userRepo.get({ userId });

  //   const entityToData = UserUtils.createEntityToData(this.encryptionService);
  //   const data = entityToData(entity);

  //   return data;
  // }

  // async ensure(userId: UserId, input: UserEnsure): Promise<UserData> {
  //   const entity = await this.db.$transaction(async (tx) => {
  //     const userRepo = new UserRepo(tx);
  //     const entity = await userRepo.get({ userId });

  //     let timezone: string | undefined = undefined;
  //     if (entity.timezone.length === 0) {
  //       timezone =
  //         input.timezone && isValidTimezone(input.timezone)
  //           ? input.timezone
  //           : FALLBACK_TIMEZONE;
  //     }

  //     let aiLanguage: string | undefined = undefined;
  //     if (entity.aiLanguage.length === 0) {
  //       aiLanguage =
  //         input.aiLanguage && isValidAiLanguage(input.aiLanguage)
  //           ? input.aiLanguage
  //           : FALLBACK_AI_LANGUAGE;
  //     }

  //     return await userRepo.update(userId, {
  //       aiLanguage,
  //       timezone,
  //     });
  //   });

  //   const userDecryptor = new UserDecryptor(this.encryptionService);
  //   const data = userDecryptor.decrypt(entity);

  //   return data;
  // }

  // async update(userId: UserId, input: UserUpdate): Promise<UserData> {
  //   const { aiLanguage, timezone } = input;
  //   if (aiLanguage && !isValidAiLanguage(aiLanguage))
  //     throw new TRPCError({
  //       code: "BAD_REQUEST",
  //       message: "Invalid aiLanguage.",
  //     });

  //   if (timezone && !isValidTimezone(timezone))
  //     throw new TRPCError({
  //       code: "BAD_REQUEST",
  //       message: "Invalid timezone.",
  //     });

  //   const userRepo = new UserRepo(this.db);
  //   const entity = await userRepo.update(userId, {
  //     aiLanguage,
  //     timezone,
  //   });

  //   const userDecryptor = new UserDecryptor(this.encryptionService);
  //   const data = userDecryptor.decrypt(entity);

  //   return data;
  // }
}

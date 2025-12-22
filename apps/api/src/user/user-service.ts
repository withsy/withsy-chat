import { Injectable } from "@nestjs/common";
import { UserPreferencesRaw } from "@repo/common";
import { DbService } from "../db/db-service";
import { EncryptionService } from "../encryption/encryption-service";
import { IdempotencyKeyRepo } from "../idempotency-key/idempotency-key-repo";
import { RefreshTokenService } from "../refresh-token/refresh-token-service";
import { UserLinkAccountRepo } from "../user-link-account/user-link-account-repo";
import { UserRepo } from "./user-repo";
import {
  UserGetPreferences,
  UserId,
  UserLogin,
  UserLoginOutput,
  UserUpdatePreferences,
} from "./user-schemas";

@Injectable()
export class UserService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly dbService: DbService,
    private readonly refreshTokenService: RefreshTokenService,
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

    return await this.dbService.db.$transaction(async (tx) => {
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

  async getPreferences(input: UserGetPreferences): Promise<UserPreferencesRaw> {
    const { userId } = input;

    const userRepo = new UserRepo(this.dbService.db);
    return await userRepo.getPreferences(userId);
  }

  async updatePreferences(
    userId: UserId,
    input: UserUpdatePreferences,
  ): Promise<UserPreferencesRaw> {
    const userRepo = new UserRepo(this.dbService.db);
    return await userRepo.updatePreferences(userId, input);
  }
}

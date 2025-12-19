import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { EncryptionService } from "src/encryption/encryption.service";
import { IdempotencyKeyRepo } from "src/idempotency-key/idempotency-key-repo";
import { RefreshTokenService } from "src/refresh-token/refresh-token.service";
import { UserLinkAccountRepo } from "src/user-link-account/user-link-account-repo";
import {
  UserId,
  UserLogin,
  UserLoginOutput,
  UserPreferencesRaw,
  UserUpdatePreferences,
} from "./user-schemas";
import { UserRepo } from "./user.repo";

@Injectable()
export class UserService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly dbService: DbService,
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

  async getPreferences(userId: UserId): Promise<UserPreferencesRaw> {
    const userRepo = new UserRepo(this.dbService.db);
    return await userRepo.getPreferences(userId);
  }

  async updatePreferences(
    userId: UserId,
    input: UserUpdatePreferences
  ): Promise<UserPreferencesRaw> {
    const userRepo = new UserRepo(this.dbService.db);
    return await userRepo.updatePreferences(userId, input);
  }
}

import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserLinkAccountModel } from "../generated/prisma/models";
import { IdempotencyKeyRepo } from "../idempotency-key/idempotency-key.repo";
import { UserUsageLimitRepo } from "../user-usage-limit/user-usage-limit.repo";
import { UserRepo } from "../user/user.repo";
import { UserLinkAccountRepo } from "./user-link-account.repo";

export class UserLinkAccountService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db
  ) {}

  async ensure(input: {
    idempotencyKey: string;
    provider: string;
    providerAccountId: string;
    refreshToken?: string;
    name?: string;
    email?: string;
    imageUrl?: string;
  }): Promise<UserLinkAccountModel> {
    const {
      idempotencyKey,
      provider,
      providerAccountId,
      refreshToken,
      name = "",
      email = "",
      imageUrl = "",
    } = input;

    const nameEncrypted = this.encryptionService.encrypt(name);
    const emailEncrypted = this.encryptionService.encrypt(email);
    const imageUrlEncrypted = this.encryptionService.encrypt(imageUrl);

    return await this.db.$transaction(async (tx) => {
      const idempotencyKeyRepo = new IdempotencyKeyRepo(tx);
      await idempotencyKeyRepo.create({
        idempotencyKey,
      });

      const userLinkAccountRepo = new UserLinkAccountRepo(tx);
      let userLinkAccountEntity = await userLinkAccountRepo.getByProviderData({
        provider,
        providerAccountId,
      });

      const userRepo = new UserRepo(tx);
      if (!userLinkAccountEntity) {
        const userEntity = await userRepo.create({
          nameEncrypted,
          emailEncrypted,
          imageUrlEncrypted,
        });

        const userId = userEntity.id;
        userLinkAccountEntity = await userLinkAccountRepo.create({
          userId,
          provider,
          providerAccountId,
        });

        const userUsageLimitRepo = new UserUsageLimitRepo(tx);
        await userUsageLimitRepo.create({ userId });
      }

      if (refreshToken) {
        await userLinkAccountRepo.update({
          userLinkAccountId: userLinkAccountEntity.id,
          refreshToken,
        });
      }

      return userLinkAccountEntity;
    });
  }
}

import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserLinkAccountModel } from "../generated/prisma/models";
import { IdempotencyInfoRepository } from "../idempotency-info/idempotency-info.repository";
import { UserUsageLimitRepository } from "../user-usage-limit/user-usage-limit.repository";
import { UserRepository } from "../user/user.repository";
import { UserLinkAccountRepository } from "./user-link-account.repository";

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
      const idempotencyInfoRepository = new IdempotencyInfoRepository(tx);
      await idempotencyInfoRepository.createOrThrow({ idempotencyKey });

      const userLinkAccountRepository = new UserLinkAccountRepository(tx);
      let userLinkAccountEntity =
        await userLinkAccountRepository.getByProviderData({
          provider,
          providerAccountId,
        });

      const userRepository = new UserRepository(tx);
      if (!userLinkAccountEntity) {
        const userEntity = await userRepository.create({
          nameEncrypted,
          emailEncrypted,
          imageUrlEncrypted,
        });

        const userId = userEntity.id;
        userLinkAccountEntity = await userLinkAccountRepository.create({
          userId,
          provider,
          providerAccountId,
        });

        const userUsageLimitRepository = new UserUsageLimitRepository(tx);
        await userUsageLimitRepository.create({ userId });
      }

      if (refreshToken) {
        await userLinkAccountRepository.update({
          userLinkAccountId: userLinkAccountEntity.id,
          refreshToken,
        });
      }

      return userLinkAccountEntity;
    });
  }
}

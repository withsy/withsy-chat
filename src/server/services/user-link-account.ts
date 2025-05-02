import type { ServiceRegistry } from "../service-registry";
import { UserService } from "./user";
import { UserUsageLimitService } from "./user-usage-limit";

export class UserLinkAccountService {
  constructor(private readonly service: ServiceRegistry) {}

  async ensure(input: {
    provider: string;
    providerAccountId: string;
    refreshToken?: string;
    name?: string;
    email?: string;
    imageUrl?: string;
  }) {
    const { provider, providerAccountId, refreshToken, name, email, imageUrl } =
      input;

    const nameEncrypted = name
      ? this.service.encryption.encrypt(name)
      : this.service.encryption.emptyStringEncrypted;
    const emailEncrypted = email
      ? this.service.encryption.encrypt(email)
      : this.service.encryption.emptyStringEncrypted;
    const imageUrlEncrypted = imageUrl
      ? this.service.encryption.encrypt(imageUrl)
      : this.service.encryption.emptyStringEncrypted;

    const res = await this.service.db.$transaction(async (tx) => {
      let linkAccount = await tx.userLinkAccount.findFirst({
        where: {
          provider,
          providerAccountId,
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!linkAccount) {
        const user = await UserService.create(tx, {
          nameEncrypted,
          emailEncrypted,
          imageUrlEncrypted,
        });
        linkAccount = await tx.userLinkAccount.create({
          data: {
            userId: user.id,
            provider,
            providerAccountId,
          },
          select: {
            id: true,
            userId: true,
          },
        });
        await UserUsageLimitService.create(tx, { userId: user.id });
      }

      if (refreshToken)
        await tx.userLinkAccount.update({
          data: {
            refreshToken,
          },
          where: {
            id: linkAccount.id,
          },
        });

      return {
        userId: linkAccount.userId,
      };
    });

    return res;
  }
}

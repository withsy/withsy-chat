import { inject } from "../service-registry";
import { UserService } from "./user";
import { UserUsageLimitService } from "./user-usage-limit";

export class UserLinkAccountService {
  private readonly encryption = inject("encryption");
  private readonly db = inject("db");

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
      ? this.encryption.encrypt(name)
      : this.encryption.encrypt("");
    const emailEncrypted = email
      ? this.encryption.encrypt(email)
      : this.encryption.encrypt("");
    const imageUrlEncrypted = imageUrl
      ? this.encryption.encrypt(imageUrl)
      : this.encryption.encrypt("");

    const res = await this.db.$transaction(async (tx) => {
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

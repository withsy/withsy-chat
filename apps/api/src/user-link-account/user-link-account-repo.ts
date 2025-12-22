import { Tx } from "../db/db-service";
import type { UserLinkAccountModel } from "../generated/prisma/models";
import { UserId } from "../user/user-schemas";

export class UserLinkAccountRepo {
  constructor(private readonly tx: Tx) {}

  async getByProviderData(input: {
    provider: string;
    providerAccountId: string;
  }): Promise<UserLinkAccountModel | null> {
    const { provider, providerAccountId } = input;

    return await this.tx.userLinkAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
  }

  async create(input: {
    userId: UserId;
    provider: string;
    providerAccountId: string;
  }): Promise<UserLinkAccountModel> {
    const { userId, provider, providerAccountId } = input;

    return await this.tx.userLinkAccount.create({
      data: {
        userId,
        provider,
        providerAccountId,
      },
    });
  }
}

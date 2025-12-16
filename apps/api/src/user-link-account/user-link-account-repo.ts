import { Tx } from "src/db/db.host";
import type { UserLinkAccountModel } from "../generated/prisma/models";

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

  async update(input: {
    userLinkAccountId: UserLinkAccountId;
    refreshToken?: string;
  }): Promise<UserLinkAccountModel> {
    const { userLinkAccountId, refreshToken } = input;

    return await this.tx.userLinkAccount.update({
      data: {
        refreshToken,
      },
      where: {
        id: userLinkAccountId,
      },
    });
  }
}

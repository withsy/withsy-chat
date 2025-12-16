import { Tx } from "src/db/db.host";
import { UserId } from "src/user/user-schemas";
import type { UserLinkAccountModel } from "../generated/prisma/models";
import { UserLinkAccountId } from "./user-link-account-schemas";

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

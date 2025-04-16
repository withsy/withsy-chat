import type { ServiceRegistry } from "../service-registry";

export class UserLinkAccountService {
  constructor(private readonly s: ServiceRegistry) {}

  async getOrCreateUserByProvider(input: {
    provider: string;
    providerAccountId: string;
  }) {
    const { provider, providerAccountId } = input;
    return await this.s.db.transaction().execute(async (tx) => {
      const userLinkAccount = await tx
        .selectFrom("userLinkAccounts")
        .where("provider", "=", provider)
        .where("providerAccountId", "=", providerAccountId)
        .select("userId")
        .executeTakeFirst();
      if (userLinkAccount) return userLinkAccount;
      const user = await tx
        .insertInto("users")
        .values({ preferences: {} })
        .returning("id")
        .executeTakeFirstOrThrow();
      await tx
        .insertInto("userLinkAccounts")
        .values({
          userId: user.id,
          provider,
          providerAccountId,
        })
        .executeTakeFirstOrThrow();
      return {
        userId: user.id,
      };
    });
  }
}

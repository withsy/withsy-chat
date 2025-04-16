import type { ServiceRegistry } from "../service-registry";

export class UserLinkAccountService {
  constructor(private readonly service: ServiceRegistry) {}

  async getOrCreateUserByProvider(input: {
    provider: string;
    providerAccountId: string;
  }) {
    const { provider, providerAccountId } = input;
    return await this.service.db.transaction().execute(async (tx) => {
      const userLinkAccount = await tx
        .selectFrom("userLinkAccounts as ula")
        .where("ula.provider", "=", provider)
        .where("ula.providerAccountId", "=", providerAccountId)
        .select("ula.userId")
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

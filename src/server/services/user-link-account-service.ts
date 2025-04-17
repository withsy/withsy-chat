import type { ServiceRegistry } from "../service-registry";

export class UserLinkAccountService {
  constructor(private readonly service: ServiceRegistry) {}

  async ensureUserByAccount(input: {
    provider: string;
    providerAccountId: string;
    refreshToken?: string;
  }) {
    const { provider, providerAccountId, refreshToken } = input;
    const res = await this.service.db.transaction().execute(async (tx) => {
      let ula = await tx
        .selectFrom("userLinkAccounts as ula")
        .where("ula.provider", "=", provider)
        .where("ula.providerAccountId", "=", providerAccountId)
        .select(["ula.id", "ula.userId"])
        .executeTakeFirst();

      if (!ula) {
        const user = await tx
          .insertInto("users")
          .values({ preferences: {} })
          .returning("id")
          .executeTakeFirstOrThrow();
        ula = await tx
          .insertInto("userLinkAccounts")
          .values({
            userId: user.id,
            provider,
            providerAccountId,
          })
          .returning(["userLinkAccounts.id", "userLinkAccounts.userId"])
          .executeTakeFirstOrThrow();
      }

      if (refreshToken)
        await tx
          .updateTable("userLinkAccounts as ula")
          .set({ refreshToken })
          .where("ula.id", "=", ula.id)
          .executeTakeFirstOrThrow();

      return {
        userId: ula.userId,
      };
    });

    return res;
  }
}

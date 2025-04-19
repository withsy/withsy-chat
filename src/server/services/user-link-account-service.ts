import type { ServiceRegistry } from "../service-registry";

export class UserLinkAccountService {
  constructor(private readonly service: ServiceRegistry) {}

  async ensureUserByAccount(input: {
    provider: string;
    providerAccountId: string;
    refreshToken?: string;
  }) {
    const { provider, providerAccountId, refreshToken } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      let ula = await tx.userLinkAccounts.findFirst({
        select: {
          id: true,
          userId: true,
        },
        where: {
          provider,
          providerAccountId,
        },
      });

      if (!ula) {
        const user = await tx.users.create({
          data: {
            preferences: {},
          },
          select: {
            id: true,
          },
        });
        ula = await tx.userLinkAccounts.create({
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
      }

      if (refreshToken)
        await tx.userLinkAccounts.update({
          data: {
            refreshToken,
          },
          where: {
            id: ula.id,
          },
        });

      return {
        userId: ula.userId,
      };
    });

    return res;
  }
}

import type { ServiceRegistry } from "../service-registry";
import { UserService } from "./user";
import { UserUsageLimitService } from "./user-usage-limit-service";

export class UserLinkAccountService {
  constructor(private readonly service: ServiceRegistry) {}

  async ensure(input: {
    provider: string;
    providerAccountId: string;
    refreshToken?: string;
    name?: string;
    email?: string;
    image?: string;
  }) {
    const { provider, providerAccountId, refreshToken, name, email, image } =
      input;

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
        const user = await UserService.create(tx, { name, email, image });
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

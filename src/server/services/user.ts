import { UserSelect, type UserEnsure, type UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserService {
  constructor(private readonly service: ServiceRegistry) {}

  async ensure(userId: UserId, input: UserEnsure) {
    const { language, timezone } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: UserSelect,
      });

      const updated = tx.user.update({
        where: { id: userId },
        data: {
          language: user.language.length === 0 ? language : undefined,
          timezone: user.timezone.length === 0 ? timezone : undefined,
        },
        select: UserSelect,
      });

      return updated;
    });

    return res;
  }

  static async create(
    tx: Tx,
    input: { name?: string; email?: string; image?: string }
  ) {
    const { name, email, image } = input;
    const res = await tx.user.create({
      data: {
        name,
        email,
        image,
      },
      select: {
        id: true,
      },
    });

    return res;
  }
}

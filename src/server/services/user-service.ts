import { UpdateUserPrefs, type UserId } from "@/types/user";
import type { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";

export class UserService {
  constructor(private readonly service: ServiceRegistry) {}

  async prefs(userId: UserId) {
    const { preferences } = await this.service.db.users.findUniqueOrThrow({
      select: {
        preferences: true,
      },
      where: {
        id: userId,
      },
    });
    return preferences;
  }

  async updatePrefs(userId: UserId, input: UpdateUserPrefs) {
    const patch = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    );

    const { preferences } = await this.service.db.$transaction(async (tx) => {
      const affected =
        await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} ::uuid FOR UPDATE`;
      if (affected === 0)
        throw new HttpServerError(StatusCodes.NOT_FOUND, `User not found.`);
      const xs = await tx.$queryRaw<{ preferences: Prisma.JsonValue }[]>`
        UPDATE users 
        SET preferences = preferences || ${patch} ::jsonb 
        WHERE id = ${userId} ::uuid RETURNING preferences`;
      if (xs.length === 0)
        throw new HttpServerError(StatusCodes.NOT_FOUND, `User not found.`);
      return xs[0];
    });

    return preferences;
  }
}

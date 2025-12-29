import { Tx } from "../db/db-service.js";
import {
  UserDefaultPromptModel,
  UserPromptModel,
} from "../generated/prisma/models.js";
import { UserId } from "../user/user-schemas.js";

export class UserDefaultPromptRepo {
  constructor(private readonly tx: Tx) {}

  async tryGet(
    userId: UserId,
  ): Promise<
    (UserDefaultPromptModel & { userPrompt: UserPromptModel | null }) | null
  > {
    return await this.tx.userDefaultPrompt.findUnique({
      where: {
        userId,
        user: {
          deletedAt: null,
        },
        userPrompt: {
          deletedAt: null,
        },
      },
      include: {
        userPrompt: true,
      },
    });
  }
}

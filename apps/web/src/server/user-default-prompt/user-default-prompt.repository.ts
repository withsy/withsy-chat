import type { UserId } from "@/types/user";
import type { Tx } from "../db/db";
import type { UserDefaultPromptModel } from "../generated/prisma/models";

export class UserDefaultPromptRepository {
  constructor(private readonly tx: Tx) {}

  async get(input: { userId: UserId }): Promise<UserDefaultPromptModel | null> {
    const { userId } = input;

    return await this.tx.userDefaultPrompt.findUnique({
      where: {
        userId,
      },
    });
  }
}

import type { UserId } from "@/types/user";
import type { UserPromptId } from "@/types/user-prompt";
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

  async create(input: {
    userId: UserId;
    userPromptId: UserPromptId | null;
  }): Promise<UserDefaultPromptModel> {
    const { userId, userPromptId } = input;

    return await this.tx.userDefaultPrompt.create({
      data: {
        userId,
        userPromptId,
      },
    });
  }

  async update(input: {
    userId: UserId;
    userPromptId?: UserPromptId | null;
  }): Promise<UserDefaultPromptModel> {
    const { userId, userPromptId } = input;

    return await this.tx.userDefaultPrompt.update({
      where: {
        userId,
      },
      data: {
        userPromptId,
      },
    });
  }
}

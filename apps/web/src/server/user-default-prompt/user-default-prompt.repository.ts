import type { UserId } from "@/types/user";
import type { UserPromptId } from "@/types/user-prompt";
import camelcaseKeys from "camelcase-keys";
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

  async upsert(input: {
    userId: UserId;
    userPromptId: UserPromptId | null;
  }): Promise<UserDefaultPromptModel> {
    const { userId, userPromptId } = input;

    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
INSERT INTO user_default_prompts
  (user_id, user_prompt_id)
VALUES
  (${userId}, ${userPromptId})
ON CONFLICT (user_id)
DO UPDATE SET
  user_prompt_id = EXCLUDED.user_prompt_id
RETURNING *;
`;

    const entity = camelcaseKeys(rows[0]);
    return entity as UserDefaultPromptModel;
  }
}

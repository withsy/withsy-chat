import type { UserId } from "@/types/user";
import {
  UserDefaultPromptData,
  UserDefaultPromptUpdate,
} from "@/types/user-default-prompt";
import type { Db } from "../db/db";
import { UserDefaultPromptDecryptor } from "./user-default-prompt.decryptor";
import { UserDefaultPromptRepository } from "./user-default-prompt.repository";

export class UserDefaultPromptService {
  constructor(private readonly db: Db) {}

  async get(input: { userId: UserId }): Promise<UserDefaultPromptData> {
    const { userId } = input;

    const entity = await this.db.$transaction(async (tx) => {
      const userDefaultPromptRepository = new UserDefaultPromptRepository(tx);
      let entity = await userDefaultPromptRepository.get({ userId });
      if (!entity) {
        entity = await userDefaultPromptRepository.create({
          userId,
          userPromptId: null,
        });
      }

      return entity;
    });

    const userDefaultPromptDecryptor = new UserDefaultPromptDecryptor();
    const data = userDefaultPromptDecryptor.decrypt(entity);

    return data;
  }

  async update(
    input: { userId: UserId } & UserDefaultPromptUpdate
  ): Promise<UserDefaultPromptData> {
    const { userId, userPromptId } = input;

    const userDefaultPromptRepository = new UserDefaultPromptRepository(
      this.db
    );
    const entity = await userDefaultPromptRepository.update({
      userId,
      userPromptId,
    });

    const userDefaultPromptDecryptor = new UserDefaultPromptDecryptor();
    const data = userDefaultPromptDecryptor.decrypt(entity);

    return data;
  }
}

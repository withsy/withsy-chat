import type { UserId } from "@/types/user";
import {
  UserDefaultPromptData,
  UserDefaultPromptGetOutput,
  UserDefaultPromptUpsert,
} from "@/types/user-default-prompt";
import type { Db } from "../db/db";
import { UserDefaultPromptDecryptor } from "./user-default-prompt.decryptor";
import { UserDefaultPromptRepo } from "./user-default-prompt.repo";

export class UserDefaultPromptService {
  constructor(private readonly db: Db) {}

  async get(input: { userId: UserId }): Promise<UserDefaultPromptGetOutput> {
    const { userId } = input;

    const userDefaultPromptRepo = new UserDefaultPromptRepo(this.db);
    const entity = await userDefaultPromptRepo.get({ userId });

    const userDefaultPromptDecryptor = new UserDefaultPromptDecryptor();
    const data = entity ? userDefaultPromptDecryptor.decrypt(entity) : null;

    return data;
  }

  async upsert(
    input: { userId: UserId } & UserDefaultPromptUpsert
  ): Promise<UserDefaultPromptData> {
    const userDefaultPromptRepo = new UserDefaultPromptRepo(this.db);
    const entity = await userDefaultPromptRepo.upsert(input);

    const userDefaultPromptDecryptor = new UserDefaultPromptDecryptor();
    const data = userDefaultPromptDecryptor.decrypt(entity);

    return data;
  }
}

import type { UserDefaultPromptData } from "@/types/user-default-prompt";
import type { Db } from "../db/db";
import type { UserDefaultPromptModel } from "../generated/prisma/models";
import { UserDefaultPromptService } from "./user-default-prompt.service";

export function createService(context: { db: Db }): UserDefaultPromptService {
  const { db } = context;

  return new UserDefaultPromptService(db);
}

export function entityToData(
  entity: UserDefaultPromptModel
): UserDefaultPromptData {
  const data: UserDefaultPromptData = {
    userPromptId: entity.userPromptId,
  };

  return data;
}

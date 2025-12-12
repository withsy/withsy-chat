import type { UserDefaultPromptData } from "@/types/user-default-prompt";
import type { UserDefaultPromptModel } from "../generated/prisma/models";

export class UserDefaultPromptDecryptor {
  decrypt(entity: UserDefaultPromptModel): UserDefaultPromptData {
    const data: UserDefaultPromptData = {
      userPromptId: entity.userPromptId,
    };

    return data;
  }
}

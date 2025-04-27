import { UserDefaultPrompt, UserPrompt } from "@/types";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";

export class UserDefaultPromptService {
  constructor(private readonly service: ServiceRegistry) {}

  async get(userId: UserId) {
    const res = await this.service.db.userDefaultPrompt.findUnique({
      where: { userId },
      select: {
        ...UserDefaultPrompt.Select,
        userPrompt: { select: UserPrompt.Select },
      },
    });

    return res;
  }

  async update(userId: UserId, input: UserDefaultPrompt.Update) {
    const { userPromptId } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      let userDefaultPrompt = await tx.userDefaultPrompt.findUnique({
        where: { userId },
        select: {
          ...UserDefaultPrompt.Select,
          userPrompt: { select: UserPrompt.Select },
        },
      });

      if (!userDefaultPrompt)
        userDefaultPrompt = await tx.userDefaultPrompt.create({
          data: {
            userId,
            userPromptId,
          },
          select: {
            ...UserDefaultPrompt.Select,
            userPrompt: { select: UserPrompt.Select },
          },
        });

      userDefaultPrompt = await tx.userDefaultPrompt.update({
        where: { userId },
        data: { userPromptId },
        select: {
          ...UserDefaultPrompt.Select,
          userPrompt: { select: UserPrompt.Select },
        },
      });

      return userDefaultPrompt;
    });

    return res;
  }
}

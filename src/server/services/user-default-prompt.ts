import { UserDefaultPrompt, UserPrompt } from "@/types";
import type { UserPromptId } from "@/types/id";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

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
      const res = await UserDefaultPromptService.update(tx, {
        userId,
        userPromptId,
      });

      return res;
    });

    return res;
  }

  static async update(
    tx: Tx,
    input: { userId: UserId; userPromptId: UserPromptId | null }
  ) {
    const { userId, userPromptId } = input;
    let userDefaultPrompt = await tx.userDefaultPrompt.findUnique({
      where: { userId },
      select: {
        ...UserDefaultPrompt.Select,
        userPrompt: { select: UserPrompt.Select },
      },
    });

    if (!userDefaultPrompt) {
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
    } else {
      userDefaultPrompt = await tx.userDefaultPrompt.update({
        where: { userId },
        data: { userPromptId },
        select: {
          ...UserDefaultPrompt.Select,
          userPrompt: { select: UserPrompt.Select },
        },
      });
    }

    return userDefaultPrompt;
  }
}

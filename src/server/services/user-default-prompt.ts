import type { UserId, UserPromptId } from "@/types/id";
import * as UserDefaultPrompt from "@/types/user-default-prompt";
import * as UserPrompt from "@/types/user-prompt";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserDefaultPromptService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(
    entity: UserDefaultPrompt.Entity & { userPrompt?: UserPrompt.Entity | null }
  ): UserDefaultPrompt.Data {
    const data = {
      userPromptId: entity.userPromptId,
      userPrompt: entity.userPrompt
        ? this.service.userPrompt.decrypt(entity.userPrompt)
        : null,
    } satisfies UserDefaultPrompt.Data;
    return data;
  }

  async get(userId: UserId): Promise<UserDefaultPrompt.GetOutput> {
    const entity = await this.service.db.$transaction(async (tx) => {
      const entity = await UserDefaultPromptService.get(tx, { userId });
      return entity;
    });

    const data = entity ? this.decrypt(entity) : entity;
    return data;
  }

  async update(
    userId: UserId,
    input: UserDefaultPrompt.Update
  ): Promise<UserDefaultPrompt.Data> {
    const { userPromptId } = input;
    const entity = await this.service.db.$transaction(async (tx) => {
      const entity = await UserDefaultPromptService.update(tx, {
        userId,
        userPromptId,
      });

      return entity;
    });

    const data = this.decrypt(entity);
    return data;
  }

  static async get(tx: Tx, input: { userId: UserId }) {
    const { userId } = input;
    const res = await tx.userDefaultPrompt.findUnique({
      where: { userId },
      select: {
        ...UserDefaultPrompt.Select,
        userPrompt: { select: UserPrompt.Select },
      },
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

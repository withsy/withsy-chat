import type { UserId, UserPromptId } from "@/types/id";
import {
  UserDefaultPromptData,
  UserDefaultPromptEntity,
  UserDefaultPromptGetOutput,
  UserDefaultPromptSelect,
  UserDefaultPromptUpdate,
} from "@/types/user-default-prompt";
import { UserPromptEntity, UserPromptSelect } from "@/types/user-prompt";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserDefaultPromptService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(
    entity: UserDefaultPromptEntity & { userPrompt?: UserPromptEntity | null }
  ): UserDefaultPromptData {
    const data = {
      userPromptId: entity.userPromptId,
      userPrompt: entity.userPrompt
        ? this.service.userPrompt.decrypt(entity.userPrompt)
        : null,
    } satisfies UserDefaultPromptData;
    return data;
  }

  async get(userId: UserId): Promise<UserDefaultPromptGetOutput> {
    const entity = await this.service.db.$transaction(async (tx) => {
      const entity = await UserDefaultPromptService.get(tx, { userId });
      return entity;
    });

    const data = entity ? this.decrypt(entity) : entity;
    return data;
  }

  async update(
    userId: UserId,
    input: UserDefaultPromptUpdate
  ): Promise<UserDefaultPromptData> {
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
        ...UserDefaultPromptSelect,
        userPrompt: { select: UserPromptSelect },
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
        ...UserDefaultPromptSelect,
        userPrompt: { select: UserPromptSelect },
      },
    });

    if (!userDefaultPrompt) {
      userDefaultPrompt = await tx.userDefaultPrompt.create({
        data: {
          userId,
          userPromptId,
        },
        select: {
          ...UserDefaultPromptSelect,
          userPrompt: { select: UserPromptSelect },
        },
      });
    } else {
      userDefaultPrompt = await tx.userDefaultPrompt.update({
        where: { userId },
        data: { userPromptId },
        select: {
          ...UserDefaultPromptSelect,
          userPrompt: { select: UserPromptSelect },
        },
      });
    }

    return userDefaultPrompt;
  }
}

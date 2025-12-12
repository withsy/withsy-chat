import type { UserId } from "@/types/user";
import {
  UserDefaultPromptData,
  UserDefaultPromptEntity,
  UserDefaultPromptGetOutput,
  UserDefaultPromptSelect,
  UserDefaultPromptUpdate,
} from "@/types/user-default-prompt";
import {
  UserPromptEntity,
  UserPromptId,
  UserPromptSelect,
} from "@/types/user-prompt";
import type { UserPromptService } from "../user-prompt/user-prompt.service";
import type { Db, Tx } from "./db";

export class UserDefaultPromptService {
  constructor(
    private readonly userPromptService: UserPromptService,
    private readonly db: Db
  ) {}

  decrypt(
    entity: UserDefaultPromptEntity & { userPrompt?: UserPromptEntity | null }
  ): UserDefaultPromptData {
    const data = {
      userPromptId: entity.userPromptId,
      userPrompt: entity.userPrompt
        ? this.userPromptService.decrypt(entity.userPrompt)
        : null,
    } satisfies UserDefaultPromptData;
    return data;
  }

  async get(userId: UserId): Promise<UserDefaultPromptGetOutput> {
    const entity = await this.db.$transaction(async (tx) => {
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
    const entity = await this.db.$transaction(async (tx) => {
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

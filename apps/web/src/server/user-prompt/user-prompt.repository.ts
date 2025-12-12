import type { UserId } from "@/types/user";
import type { UserPromptId, UserPromptList } from "@/types/user-prompt";
import { v7 } from "uuid";
import type { Tx } from "../db/db";
import type { UserPromptModel } from "../generated/prisma/models";
import { getHardDeleteCutoffDate } from "../utils";

export class UserPromptRepository {
  constructor(private readonly tx: Tx) {}

  async listForHardDelete(): Promise<UserPromptModel[]> {
    const cutoffDate = getHardDeleteCutoffDate(new Date());

    return await this.tx.userPrompt.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate,
        },
      },
    });
  }

  async doHardDelete(input: {
    userPromptIds: UserPromptId[];
  }): Promise<number> {
    const { userPromptIds } = input;

    const result = await this.tx.userPrompt.deleteMany({
      where: {
        id: {
          in: userPromptIds,
        },
      },
    });

    return result.count;
  }

  async get(input: {
    userId: UserId;
    userPromptId: UserPromptId;
  }): Promise<UserPromptModel> {
    const { userId, userPromptId } = input;

    return await this.tx.userPrompt.findUniqueOrThrow({
      where: {
        userId,
        deletedAt: null,
        id: userPromptId,
      },
    });
  }

  async list(
    input: { userId: UserId } & UserPromptList
  ): Promise<UserPromptModel[]> {
    const { userId, limit, cursor } = input;

    const entities = await this.tx.userPrompt.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        id: "asc",
      },
      take: limit,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
    });

    return entities;
  }

  async create(input: {
    userId: UserId;
    titleEncrypted: string;
    textEncrypted: string;
  }): Promise<UserPromptModel> {
    const { userId, titleEncrypted, textEncrypted } = input;

    return await this.tx.userPrompt.create({
      data: {
        id: v7(),
        userId,
        titleEncrypted,
        textEncrypted,
      },
    });
  }

  async update(input: {
    userId: UserId;
    userPromptId: UserPromptId;
    titleEncrypted?: string;
    textEncrypted?: string;
    isStarred?: boolean;
  }): Promise<UserPromptModel> {
    const { userId, userPromptId, titleEncrypted, textEncrypted, isStarred } =
      input;

    return await this.tx.userPrompt.update({
      where: {
        userId,
        deletedAt: null,
        id: userPromptId,
      },
      data: {
        titleEncrypted,
        textEncrypted,
        isStarred,
      },
    });
  }
}

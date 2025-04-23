import {
  PromptMetaSelect,
  PromptSelect,
  type PromptGet,
  type PromptList,
  type PromptUpdate,
} from "@/types/prompt";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";

export class PromptService {
  constructor(private readonly service: ServiceRegistry) {}

  async get(userId: UserId, input: PromptGet) {
    const { promptId } = input;
    const res = await this.service.db.prompt.findUniqueOrThrow({
      where: {
        userId,
        deletedAt: null,
        id: promptId,
      },
      select: PromptSelect,
    });

    return res;
  }

  async list(userId: UserId, _input: PromptList) {
    const xs = await this.service.db.prompt.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        id: "asc",
      },
      select: PromptMetaSelect,
    });

    return xs;
  }

  async update(userId: UserId, input: PromptUpdate) {
    const { promptId, title, text, isStarred } = input;
    const res = await this.service.db.prompt.update({
      where: {
        userId,
        deletedAt: null,
        id: promptId,
      },
      data: {
        title,
        text,
        isStarred,
      },
      select: PromptSelect,
    });

    return res;
  }
}

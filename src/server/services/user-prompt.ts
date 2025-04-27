import { UserPrompt } from "@/types";
import type { UserId } from "@/types/user";
import { uuidv7 } from "uuidv7";
import type { ServiceRegistry } from "../service-registry";
import { IdempotencyInfoService } from "./idempotency-info";

export class UserPromptService {
  constructor(private readonly service: ServiceRegistry) {}

  async get(userId: UserId, input: UserPrompt.Get) {
    const { userPromptId } = input;
    const res = await this.service.db.userPrompt.findUniqueOrThrow({
      where: { userId, id: userPromptId },
      select: UserPrompt.Select,
    });

    return res;
  }

  async list(userId: UserId) {
    const res = await this.service.db.userPrompt.findMany({
      where: { userId },
      select: UserPrompt.Select,
    });

    return res;
  }

  async create(userId: UserId, input: UserPrompt.Create) {
    const { idempotencyKey, title, text } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const userPrompt = await tx.userPrompt.create({
        data: { id: UserPromptService.generateId(), userId, title, text },
        select: UserPrompt.Select,
      });

      return userPrompt;
    });

    return res;
  }

  async update(userId: UserId, input: UserPrompt.Update) {
    const { userPromptId, title, text, isStarred } = input;
    const res = await this.service.db.userPrompt.update({
      where: { userId, id: userPromptId },
      data: { title, text, isStarred },
      select: UserPrompt.Select,
    });

    return res;
  }

  static generateId() {
    return uuidv7();
  }
}

import { UserPrompt } from "@/types";
import type { UserId } from "@/types/user";
import { uuidv7 } from "uuidv7";
import type { ServiceRegistry } from "../service-registry";
import { getHardDeleteCutoffDate } from "../utils";
import { IdempotencyInfoService } from "./idempotency-info";
import { UserDefaultPromptService } from "./user-default-prompt";

export class UserPromptService {
  constructor(private readonly service: ServiceRegistry) {}

  async get(userId: UserId, input: UserPrompt.Get) {
    const { userPromptId } = input;
    const res = await this.service.db.userPrompt.findUniqueOrThrow({
      where: { userId, deletedAt: null, id: userPromptId },
      select: UserPrompt.Select,
    });

    return res;
  }

  async list(userId: UserId) {
    const xs = await this.service.db.userPrompt.findMany({
      where: { userId, deletedAt: null },
      orderBy: { id: "asc" },
      select: UserPrompt.Select,
    });

    return xs;
  }

  async listDeleted(userId: UserId) {
    const xs = await this.service.db.userPrompt.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { id: "asc" },
      select: UserPrompt.Select,
    });

    return xs;
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
      where: { userId, deletedAt: null, id: userPromptId },
      data: { title, text, isStarred },
      select: UserPrompt.Select,
    });

    return res;
  }

  async delete(userId: UserId, input: UserPrompt.Delete) {
    const { userPromptId } = input;
    await this.service.db.$transaction(async (tx) => {
      const userDefaultPrompt = await UserDefaultPromptService.get(tx, {
        userId,
      });

      if (
        userDefaultPrompt &&
        userDefaultPrompt.userPromptId &&
        userDefaultPrompt.userPromptId === userPromptId
      ) {
        await UserDefaultPromptService.update(tx, {
          userId,
          userPromptId: null,
        });
      }

      await tx.userPrompt.update({
        where: { userId, deletedAt: null, id: userPromptId },
        data: { deletedAt: new Date() },
      });
    });
  }

  async restore(userId: UserId, input: UserPrompt.Restore) {
    const { userPromptId } = input;
    const res = await this.service.db.userPrompt.update({
      where: { id: userPromptId, userId, deletedAt: { not: null } },
      data: { deletedAt: null },
      select: UserPrompt.Select,
    });

    return res;
  }

  async onHardDeleteTask() {
    const cutoffDate = getHardDeleteCutoffDate(new Date());

    await this.service.db.$transaction(async (tx) => {
      const userPromptsToDelete = await tx.userPrompt.findMany({
        where: { deletedAt: { not: null, lt: cutoffDate } },
        select: { id: true },
      });

      if (userPromptsToDelete.length === 0) return;

      const userPromptIds = userPromptsToDelete.map((x) => x.id);
      console.warn(
        `Preparing to delete ${
          userPromptIds.length
        }. userPrompts: ${userPromptIds.join(", ")}`
      );

      const res = await tx.userPrompt.deleteMany({
        where: { id: { in: userPromptIds } },
      });
      console.warn(`Successfully hard deleted ${res.count} userPrompts.`);
    });
  }

  static generateId() {
    return uuidv7();
  }
}

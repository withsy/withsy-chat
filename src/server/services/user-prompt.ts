import { UserPrompt } from "@/types";
import type { UserId } from "@/types/id";
import { uuidv7 } from "uuidv7";
import type { ServiceRegistry } from "../service-registry";
import { getHardDeleteCutoffDate } from "../utils";
import { IdempotencyInfoService } from "./idempotency-info";
import { UserDefaultPromptService } from "./user-default-prompt";

export class UserPromptService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(entity: UserPrompt.Entity): UserPrompt.Data {
    const title = this.service.encryption.decrypt(entity.titleEncrypted);
    const text = this.service.encryption.decrypt(entity.textEncrypted);
    const data = {
      id: entity.id,
      title,
      text,
      isStarred: entity.isStarred,
      updatedAt: entity.updatedAt,
    } satisfies UserPrompt.Data;
    return data;
  }

  async get(userId: UserId, input: UserPrompt.Get): Promise<UserPrompt.Data> {
    const { userPromptId } = input;

    const entity = await this.service.db.userPrompt.findUniqueOrThrow({
      where: { userId, deletedAt: null, id: userPromptId },
      select: UserPrompt.Select,
    });

    const data = this.decrypt(entity);
    return data;
  }

  async list(userId: UserId): Promise<UserPrompt.ListOutput> {
    const entities = await this.service.db.userPrompt.findMany({
      where: { userId, deletedAt: null },
      orderBy: { id: "asc" },
      select: UserPrompt.Select,
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  async listDeleted(userId: UserId): Promise<UserPrompt.ListOutput> {
    const entities = await this.service.db.userPrompt.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { id: "asc" },
      select: UserPrompt.Select,
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  async create(
    userId: UserId,
    input: UserPrompt.Create
  ): Promise<UserPrompt.Data> {
    const { idempotencyKey, title, text } = input;

    const titleEncrypted = this.service.encryption.encrypt(title);
    const textEncrypted = this.service.encryption.encrypt(text);

    const entity = await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const entity = await tx.userPrompt.create({
        data: {
          id: UserPromptService.generateId(),
          userId,
          titleEncrypted,
          textEncrypted,
        },
        select: UserPrompt.Select,
      });

      return entity;
    });

    const data = this.decrypt(entity);
    return data;
  }

  async update(
    userId: UserId,
    input: UserPrompt.Update
  ): Promise<UserPrompt.Data> {
    const { userPromptId, title, text, isStarred } = input;

    const titleEncrypted =
      title != null ? this.service.encryption.encrypt(title) : undefined;
    const textEncrypted =
      text != null ? this.service.encryption.encrypt(text) : undefined;

    const entity = await this.service.db.userPrompt.update({
      where: { userId, deletedAt: null, id: userPromptId },
      data: { titleEncrypted, textEncrypted, isStarred },
      select: UserPrompt.Select,
    });

    const data = this.decrypt(entity);
    return data;
  }

  async delete(userId: UserId, input: UserPrompt.Delete): Promise<void> {
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

  async restore(
    userId: UserId,
    input: UserPrompt.Restore
  ): Promise<UserPrompt.Data> {
    const { userPromptId } = input;

    const entity = await this.service.db.userPrompt.update({
      where: { id: userPromptId, userId, deletedAt: { not: null } },
      data: { deletedAt: null },
      select: UserPrompt.Select,
    });

    const data = this.decrypt(entity);
    return data;
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

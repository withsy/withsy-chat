import type { UserId } from "@/types/user";
import {
  UserPromptCreate,
  UserPromptData,
  UserPromptDelete,
  UserPromptEntity,
  UserPromptGet,
  UserPromptListOutput,
  UserPromptRestore,
  UserPromptSelect,
  UserPromptUpdate,
} from "@/types/user-prompt";
import { v7 as uuidv7 } from "uuid";
import type { EncryptionService } from "../encryption/encryption.service";
import type { Db } from "../services/db";
import { IdempotencyInfoService } from "../services/idempotency-info";
import { UserDefaultPromptService } from "../services/user-default-prompt";
import { UserPromptRepository } from "./user-prompt.repository";

export class UserPromptService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db
  ) {}

  decrypt(entity: UserPromptEntity): UserPromptData {
    const title = this.encryptionService.decrypt(entity.titleEncrypted);
    const text = this.encryptionService.decrypt(entity.textEncrypted);
    const data = {
      id: entity.id,
      title,
      text,
      isStarred: entity.isStarred,
      updatedAt: entity.updatedAt,
    } satisfies UserPromptData;
    return data;
  }

  async get(userId: UserId, input: UserPromptGet): Promise<UserPromptData> {
    const { userPromptId } = input;

    const entity = await this.db.userPrompt.findUniqueOrThrow({
      where: { userId, deletedAt: null, id: userPromptId },
      select: UserPromptSelect,
    });

    const data = this.decrypt(entity);
    return data;
  }

  async list(userId: UserId): Promise<UserPromptListOutput> {
    const entities = await this.db.userPrompt.findMany({
      where: { userId, deletedAt: null },
      orderBy: { id: "asc" },
      select: UserPromptSelect,
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  async listDeleted(userId: UserId): Promise<UserPromptListOutput> {
    const entities = await this.db.userPrompt.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { id: "asc" },
      select: UserPromptSelect,
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  async create(
    userId: UserId,
    input: UserPromptCreate
  ): Promise<UserPromptData> {
    const { idempotencyKey, title, text } = input;

    const titleEncrypted = this.encryptionService.encrypt(title);
    const textEncrypted = this.encryptionService.encrypt(text);

    const entity = await this.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const entity = await tx.userPrompt.create({
        data: {
          id: UserPromptService.generateId(),
          userId,
          titleEncrypted,
          textEncrypted,
        },
        select: UserPromptSelect,
      });

      return entity;
    });

    const data = this.decrypt(entity);
    return data;
  }

  async update(
    userId: UserId,
    input: UserPromptUpdate
  ): Promise<UserPromptData> {
    const { userPromptId, title, text, isStarred } = input;

    const titleEncrypted =
      title != null ? this.encryptionService.encrypt(title) : undefined;
    const textEncrypted =
      text != null ? this.encryptionService.encrypt(text) : undefined;

    const entity = await this.db.userPrompt.update({
      where: { userId, deletedAt: null, id: userPromptId },
      data: { titleEncrypted, textEncrypted, isStarred },
      select: UserPromptSelect,
    });

    const data = this.decrypt(entity);
    return data;
  }

  async delete(userId: UserId, input: UserPromptDelete): Promise<void> {
    const { userPromptId } = input;

    await this.db.$transaction(async (tx) => {
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
    input: UserPromptRestore
  ): Promise<UserPromptData> {
    const { userPromptId } = input;

    const entity = await this.db.userPrompt.update({
      where: { id: userPromptId, userId, deletedAt: { not: null } },
      data: { deletedAt: null },
      select: UserPromptSelect,
    });

    const data = this.decrypt(entity);
    return data;
  }

  async hardDeleteUserPrompts() {
    await this.db.$transaction(async (tx) => {
      const userPromptRepository = new UserPromptRepository(tx);

      const userPrompts =
        await userPromptRepository.findUserPromptsToHardDelete();
      if (userPrompts.length === 0) {
        return;
      }

      const userPromptIds = userPrompts.map((x) => x.id);
      console.warn(
        `Preparing to delete ${
          userPromptIds.length
        }. userPrompts: ${userPromptIds.join(", ")}`
      );

      const res = await userPromptRepository.hardDeleteUserPrompts(
        userPromptIds
      );
      console.warn(`Successfully hard deleted ${res.count} userPrompts.`);
    });
  }

  static generateId() {
    return uuidv7();
  }
}

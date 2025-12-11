import type { UserId } from "@/types/user";
import {
  UserPromptCreate,
  UserPromptData,
  UserPromptDelete,
  UserPromptGet,
  UserPromptList,
  UserPromptListOutput,
  UserPromptRestore,
  UserPromptUpdate,
} from "@/types/user-prompt";
import { v7 as uuidv7 } from "uuid";
import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import { IdempotencyInfoService } from "../services/idempotency-info";
import { UserDefaultPromptService } from "../services/user-default-prompt";
import { UserPromptDecryptor } from "./user-prompt.decryptor";
import { UserPromptRepository } from "./user-prompt.repository";

export class UserPromptService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db
  ) {}

  async get(
    input: { userId: UserId } & UserPromptGet
  ): Promise<UserPromptData> {
    const userPromptRepository = new UserPromptRepository(this.db);
    const entity = await userPromptRepository.get(input);

    const userPromptDecryptor = new UserPromptDecryptor(this.encryptionService);
    const data = userPromptDecryptor.decrypt(entity);

    return data;
  }

  async list(
    input: { userId: UserId } & UserPromptList
  ): Promise<UserPromptListOutput> {
    const userPromptRepository = new UserPromptRepository(this.db);
    const entities = await userPromptRepository.list(input);

    const userPromptDecryptor = new UserPromptDecryptor(this.encryptionService);
    const items = entities.map((x) => userPromptDecryptor.decrypt(x));
    const nextCursor = items.at(-1)?.id ?? null;

    return {
      items,
      nextCursor,
    };
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

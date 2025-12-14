import type { UserId } from "@/types/user";
import {
  UserPromptCreate,
  UserPromptData,
  UserPromptDelete,
  UserPromptGet,
  UserPromptList,
  UserPromptListOutput,
  UserPromptUpdate,
} from "@/types/user-prompt";
import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import { IdempotencyInfoRepo } from "../idempotency-info/idempotency-info.repo";
import { UserDefaultPromptRepo } from "../user-default-prompt/user-default-prompt.repo";
import { UserPromptDecryptor } from "./user-prompt.decryptor";
import { UserPromptRepo } from "./user-prompt.repo";

export class UserPromptService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db
  ) {}

  async get(
    input: { userId: UserId } & UserPromptGet
  ): Promise<UserPromptData> {
    const userPromptRepo = new UserPromptRepo(this.db);
    const entity = await userPromptRepo.get(input);

    const userPromptDecryptor = new UserPromptDecryptor(this.encryptionService);
    const data = userPromptDecryptor.decrypt(entity);

    return data;
  }

  async list(
    input: { userId: UserId } & UserPromptList
  ): Promise<UserPromptListOutput> {
    const userPromptRepo = new UserPromptRepo(this.db);
    const entities = await userPromptRepo.list(input);

    const userPromptDecryptor = new UserPromptDecryptor(this.encryptionService);
    const items = entities.map((x) => userPromptDecryptor.decrypt(x));
    const nextCursor = items.at(-1)?.id ?? null;

    return {
      items,
      nextCursor,
    };
  }

  async create(
    input: { userId: UserId } & UserPromptCreate
  ): Promise<UserPromptData> {
    const { userId, idempotencyKey, title, text } = input;

    const titleEncrypted = this.encryptionService.encrypt(title);
    const textEncrypted = this.encryptionService.encrypt(text);

    const entity = await this.db.$transaction(async (tx) => {
      const idempotencyInfoRepo = new IdempotencyInfoRepo(tx);
      await idempotencyInfoRepo.createOrThrow({
        idempotencyKey,
      });

      const userPromptRepo = new UserPromptRepo(tx);
      const entity = await userPromptRepo.create({
        userId,
        titleEncrypted,
        textEncrypted,
      });

      return entity;
    });

    const userPromptDecryptor = new UserPromptDecryptor(this.encryptionService);
    const data = userPromptDecryptor.decrypt(entity);

    return data;
  }

  async update(
    input: { userId: UserId } & UserPromptUpdate
  ): Promise<UserPromptData> {
    const { userId, userPromptId, title, text, isStarred } = input;

    const titleEncrypted =
      title != null ? this.encryptionService.encrypt(title) : undefined;
    const textEncrypted =
      text != null ? this.encryptionService.encrypt(text) : undefined;

    const userPromptRepo = new UserPromptRepo(this.db);
    const entity = await userPromptRepo.update({
      userId,
      userPromptId,
      titleEncrypted,
      textEncrypted,
      isStarred,
    });

    const userPromptDecryptor = new UserPromptDecryptor(this.encryptionService);
    const data = userPromptDecryptor.decrypt(entity);

    return data;
  }

  async delete(input: { userId: UserId } & UserPromptDelete): Promise<void> {
    const { userId, userPromptId } = input;

    await this.db.$transaction(async (tx) => {
      const userDefaultPromptRepo = new UserDefaultPromptRepo(tx);
      const userDefaultPrompt = await userDefaultPromptRepo.get({
        userId,
      });

      if (
        userDefaultPrompt &&
        userDefaultPrompt.userPromptId &&
        userDefaultPrompt.userPromptId === userPromptId
      ) {
        await userDefaultPromptRepo.update({
          userId,
          userPromptId: null,
        });
      }

      const userPromptRepo = new UserPromptRepo(tx);
      await userPromptRepo.delete({
        userId,
        userPromptId,
      });
    });
  }

  async doHardDelete(): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const userPromptRepo = new UserPromptRepo(tx);
      const entities = await userPromptRepo.listForHardDelete();
      if (entities.length === 0) {
        return;
      }

      const userPromptIds = entities.map((x) => x.id);
      console.warn(
        `Preparing to delete ${
          userPromptIds.length
        }. userPrompts: ${userPromptIds.join(", ")}`
      );

      const count = await userPromptRepo.doHardDelete({ userPromptIds });
      console.warn(`Successfully hard deleted ${count} userPrompts.`);
    });
  }
}

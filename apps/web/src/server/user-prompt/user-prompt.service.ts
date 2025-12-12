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
import { IdempotencyInfoRepository } from "../idempotency-info/idempotency-info.repository";
import { UserDefaultPromptRepository } from "../user-default-prompt/user-default-prompt.repository";
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
    input: { userId: UserId } & UserPromptCreate
  ): Promise<UserPromptData> {
    const { userId, idempotencyKey, title, text } = input;

    const titleEncrypted = this.encryptionService.encrypt(title);
    const textEncrypted = this.encryptionService.encrypt(text);

    const entity = await this.db.$transaction(async (tx) => {
      const idempotencyInfoRepository = new IdempotencyInfoRepository(tx);
      await idempotencyInfoRepository.createOrThrow({
        idempotencyKey,
      });

      const userPromptRepository = new UserPromptRepository(tx);
      const entity = await userPromptRepository.create({
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

    const userPromptRepository = new UserPromptRepository(this.db);
    const entity = await userPromptRepository.update({
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
      const userDefaultPromptRepository = new UserDefaultPromptRepository(tx);
      const userDefaultPrompt = await userDefaultPromptRepository.get({
        userId,
      });

      if (
        userDefaultPrompt &&
        userDefaultPrompt.userPromptId &&
        userDefaultPrompt.userPromptId === userPromptId
      ) {
        await userDefaultPromptRepository.update({
          userId,
          userPromptId: null,
        });
      }

      const userPromptRepository = new UserPromptRepository(tx);
      await userPromptRepository.delete({
        userId,
        userPromptId,
      });
    });
  }

  async doHardDelete(): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const userPromptRepository = new UserPromptRepository(tx);
      const entities = await userPromptRepository.listForHardDelete();
      if (entities.length === 0) {
        return;
      }

      const userPromptIds = entities.map((x) => x.id);
      console.warn(
        `Preparing to delete ${
          userPromptIds.length
        }. userPrompts: ${userPromptIds.join(", ")}`
      );

      const count = await userPromptRepository.doHardDelete({ userPromptIds });
      console.warn(`Successfully hard deleted ${count} userPrompts.`);
    });
  }
}

import { Model } from "@/types/model";
import type { UserId } from "@/types/user";
import {
  UserAiProfileData,
  UserAiProfileDeleteImage,
  UserAiProfileEntity,
  UserAiProfileGet,
  UserAiProfileGetAllOutput,
  UserAiProfileGetOutput,
  UserAiProfileSelect,
} from "@/types/user-ai-profile";
import type { EncryptionService } from "../encryption/encryption.service";
import type { AiProfileStorageService } from "./ai-profile-storage";
import type { Db } from "./db";
import { UserUsageLimitService } from "./user-usage-limit";

export class UserAiProfileService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db,
    private readonly aiProfileStorageService: AiProfileStorageService
  ) {}

  decrypt(entity: UserAiProfileEntity): UserAiProfileData {
    const model = Model.parse(entity.model);
    const name = this.encryptionService.decrypt(entity.nameEncrypted);
    const imagePath = this.encryptionService.decrypt(entity.imagePathEncrypted);
    const imageSource = UserAiProfileService.createImageSource({ imagePath });
    const data = {
      model,
      name,
      imageSource,
    } satisfies UserAiProfileData;
    return data;
  }

  async get(
    userId: UserId,
    input: UserAiProfileGet
  ): Promise<UserAiProfileGetOutput> {
    const { model } = input;
    const entity = await this.db.userAiProfile.findUnique({
      where: { userId_model: { userId, model } },
      select: UserAiProfileSelect,
    });

    const data = entity ? this.decrypt(entity) : null;
    return data;
  }

  async getAll(userId: UserId): Promise<UserAiProfileGetAllOutput> {
    const entities = await this.db.userAiProfile.findMany({
      where: { userId },
      select: UserAiProfileSelect,
    });

    const datas = entities.map((x) => this.decrypt(x));
    return datas;
  }

  async update(input: {
    userId: UserId;
    model: Model;
    name?: string;
    imagePath?: string;
  }): Promise<UserAiProfileData> {
    const { userId, model, name, imagePath } = input;

    const nameEncrypted = name
      ? this.encryptionService.encrypt(name)
      : undefined;
    const imagePathEncrypted = imagePath
      ? this.encryptionService.encrypt(imagePath)
      : undefined;
    const emptyNameEncrypted = this.encryptionService.encrypt("");
    const emptyImagePathEncrypted = this.encryptionService.encrypt("");

    const res = await this.db.$transaction(async (tx) => {
      let entity = await tx.userAiProfile.findUnique({
        where: { userId_model: { userId, model } },
        select: UserAiProfileSelect,
      });

      let oldImagePathEncrypted = "";
      if (!entity) {
        entity = await tx.userAiProfile.create({
          data: {
            userId,
            model,
            nameEncrypted: nameEncrypted ?? emptyNameEncrypted,
            imagePathEncrypted: imagePathEncrypted ?? emptyImagePathEncrypted,
          },
          select: UserAiProfileSelect,
        });
      } else {
        if (imagePathEncrypted)
          oldImagePathEncrypted = entity.imagePathEncrypted;

        entity = await tx.userAiProfile.update({
          where: { userId_model: { userId, model } },
          data: {
            nameEncrypted,
            imagePathEncrypted,
          },
          select: UserAiProfileSelect,
        });
      }

      if (imagePath)
        await UserUsageLimitService.decreaseAiProfileImage(tx, {
          userId,
        });

      return { entity, oldImagePathEncrypted };
    });

    const { entity, oldImagePathEncrypted } = res;
    if (oldImagePathEncrypted) {
      const oldImagePath = this.encryptionService.decrypt(
        oldImagePathEncrypted
      );
      if (oldImagePath)
        await this.aiProfileStorageService.delete({ imagePath: oldImagePath });
    }

    const data = this.decrypt(entity);
    return data;
  }

  async deleteImage(
    userId: UserId,
    input: UserAiProfileDeleteImage
  ): Promise<UserAiProfileData> {
    const { model } = input;

    const imagePathEncrypted = this.encryptionService.encrypt("");

    const res = await this.db.$transaction(async (tx) => {
      const oldEntity = await tx.userAiProfile.findUniqueOrThrow({
        where: { userId_model: { userId, model } },
        select: UserAiProfileSelect,
      });

      const oldImagePathEncrypted = oldEntity.imagePathEncrypted;

      const entity = await tx.userAiProfile.update({
        where: { userId_model: { userId, model } },
        data: { imagePathEncrypted },
        select: UserAiProfileSelect,
      });

      return { oldImagePathEncrypted, entity };
    });

    const { oldImagePathEncrypted, entity } = res;
    if (oldImagePathEncrypted) {
      const oldImagePath = this.encryptionService.decrypt(
        oldImagePathEncrypted
      );
      if (oldImagePath)
        await this.aiProfileStorageService.delete({ imagePath: oldImagePath });
    }

    const data = this.decrypt(entity);
    return data;
  }

  static createImagePath(input: { userId: UserId; fileName: string }) {
    const { userId, fileName } = input;
    return `${userId}/${fileName}`;
  }

  static createImageSource(input: { imagePath: string }) {
    const { imagePath } = input;
    const parts = imagePath.split("/"); // e.g.) <userId>/<fileName>
    const fileName = parts.at(1) ?? "";
    const imageSource =
      fileName.length > 0 ? `/api/ai-profiles/${fileName}` : "";
    return imageSource;
  }
}

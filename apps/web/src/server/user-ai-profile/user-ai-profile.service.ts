import { Model } from "@/types/model";
import type { UserId } from "@/types/user";
import {
  UserAiProfileData,
  UserAiProfileDeleteImage,
  UserAiProfileListOutput,
} from "@/types/user-ai-profile";
import type { Db } from "../db/db";
import type { EncryptionService } from "../encryption/encryption.service";
import { UserAiProfileDecryptor } from "./user-ai-profile.decryptor";
import { UserAiProfileRepo } from "./user-ai-profile.repo";

export class UserAiProfileService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db
  ) {}

  async list(input: { userId: UserId }): Promise<UserAiProfileListOutput> {
    const { userId } = input;

    const userAiProfileRepo = new UserAiProfileRepo(this.db);
    const entities = await userAiProfileRepo.list({ userId });

    const userAiProfileDecryptor = new UserAiProfileDecryptor(
      this.encryptionService
    );
    const datas = entities.map((x) => userAiProfileDecryptor.decrypt(x));

    return datas;
  }

  async update(input: {
    userId: UserId;
    model: Model;
    name?: string;
    imagePath?: string;
  }): Promise<UserAiProfileData> {
    const { userId, model, name = "", imagePath = "" } = input;

    const nameEncrypted = this.encryptionService.encrypt(name);
    const imagePathEncrypted = this.encryptionService.encrypt(imagePath);

    const res = await this.db.$transaction(async (tx) => {
      const userAiProfileRepo = new UserAiProfileRepo(tx);
      const { oldImagePathEncrypted, ...entity } =
        await userAiProfileRepo.upsert({
          userId,
          model,
          nameEncrypted,
          imagePathEncrypted,
        });

      if (imagePath) {
        await UserUsageLimitService.decreaseAiProfileImage(tx, {
          userId,
        });
      }

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
}

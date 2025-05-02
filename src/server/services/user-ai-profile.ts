import { UserAiProfile } from "@/types";
import type { UserId } from "@/types/id";
import { Model } from "@/types/model";
import type { ServiceRegistry } from "../service-registry";

export class UserAiProfileService {
  private emptyNameEncrypted: string;
  private emptyImagePathEncrypted: string;

  constructor(private readonly service: ServiceRegistry) {
    this.emptyNameEncrypted = this.service.encryption.encrypt("");
    this.emptyImagePathEncrypted = this.service.encryption.encrypt("");
  }

  async decrypt(entity: UserAiProfile.Entity): Promise<UserAiProfile.Data> {
    const model = Model.parse(entity.model);
    const name = this.service.encryption.decrypt(entity.nameEncrypted);
    const imagePath = this.service.encryption.decrypt(
      entity.imagePathEncrypted
    );
    const imageUrl =
      imagePath.length > 0
        ? await this.service.firebase.getSignedUrl(imagePath)
        : "";
    const data = {
      model,
      name,
      imageUrl,
    } satisfies UserAiProfile.Data;
    return data;
  }

  async get(
    userId: UserId,
    input: UserAiProfile.Get
  ): Promise<UserAiProfile.GetOutput> {
    const { model } = input;
    const entity = await this.service.db.userAiProfile.findUnique({
      where: { userId_model: { userId, model } },
      select: UserAiProfile.Select,
    });

    const data = entity ? this.decrypt(entity) : null;
    return data;
  }

  async getAll(userId: UserId): Promise<UserAiProfile.GetAllOutput> {
    const entities = await this.service.db.userAiProfile.findMany({
      where: { userId },
      select: UserAiProfile.Select,
    });

    const datas = await Promise.all(entities.map((x) => this.decrypt(x)));
    return datas;
  }

  async update(input: {
    userId: UserId;
    model: Model;
    name?: string;
    imagePath?: string;
  }): Promise<UserAiProfile.Data> {
    const { userId, model, name, imagePath } = input;

    const nameEncrypted = name
      ? this.service.encryption.encrypt(name)
      : undefined;
    const imagePathEncrypted = imagePath
      ? this.service.encryption.encrypt(imagePath)
      : undefined;

    const res = await this.service.db.$transaction(async (tx) => {
      let entity = await tx.userAiProfile.findUnique({
        where: { userId_model: { userId, model } },
        select: UserAiProfile.Select,
      });

      let oldImagePathEncrypted = "";
      if (!entity) {
        entity = await tx.userAiProfile.create({
          data: {
            userId,
            model,
            nameEncrypted: nameEncrypted ?? this.emptyNameEncrypted,
            imagePathEncrypted:
              imagePathEncrypted ?? this.emptyImagePathEncrypted,
          },
          select: UserAiProfile.Select,
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
          select: UserAiProfile.Select,
        });
      }

      return { entity, oldImagePathEncrypted };
    });

    const { entity, oldImagePathEncrypted } = res;
    if (oldImagePathEncrypted) {
      const oldImagePath = this.service.encryption.decrypt(
        oldImagePathEncrypted
      );
      if (oldImagePath) await this.service.firebase.delete(oldImagePath);
    }

    const data = await this.decrypt(entity);
    return data;
  }

  async deleteImage(
    userId: UserId,
    input: UserAiProfile.DeleteImage
  ): Promise<UserAiProfile.Data> {
    const { model } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      const oldEntity = await tx.userAiProfile.findUniqueOrThrow({
        where: { userId_model: { userId, model } },
        select: UserAiProfile.Select,
      });

      const oldImagePathEncrypted = oldEntity.imagePathEncrypted;
      const entity = await tx.userAiProfile.update({
        where: { userId_model: { userId, model } },
        data: { imagePathEncrypted: this.emptyImagePathEncrypted },
        select: UserAiProfile.Select,
      });

      return { oldImagePathEncrypted, entity };
    });

    const { oldImagePathEncrypted, entity } = res;
    if (oldImagePathEncrypted) {
      const oldImagePath = this.service.encryption.decrypt(
        oldImagePathEncrypted
      );
      if (oldImagePath) await this.service.firebase.delete(oldImagePath);
    }

    const data = await this.decrypt(entity);
    return data;
  }
}

import { UserAiProfile } from "@/types";
import { Model } from "@/types/model";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";

export class UserAiProfileService {
  private emptyNameEncrypted: string;
  private emptyImageUrlEncrypted: string;

  constructor(private readonly service: ServiceRegistry) {
    this.emptyNameEncrypted = this.service.encryption.encrypt("");
    this.emptyImageUrlEncrypted = this.service.encryption.encrypt("");
  }

  decrypt(entity: UserAiProfile.Entity): UserAiProfile.Data {
    const model = Model.parse(entity.model);
    const name = this.service.encryption.decrypt(entity.nameEncrypted);
    const imageUrl = this.service.encryption.decrypt(entity.imageUrlEncrypted);
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

  async update(
    userId: UserId,
    input: UserAiProfile.Update
  ): Promise<UserAiProfile.Data> {
    const { model, name, image } = input;

    const nameEncrypted = name
      ? this.service.encryption.encrypt(name)
      : undefined;

    // upload image
    const imageUrlEncrypted: string | undefined = undefined;
    if (image) {
      const a = await this.service.firebase.upload({ userId, image });
      console.log("@", a);
    }

    const res = await this.service.db.$transaction(async (tx) => {
      let entity = await tx.userAiProfile.findUnique({
        where: { userId_model: { userId, model } },
        select: UserAiProfile.Select,
      });

      let oldImageUrlEncrypted = "";
      if (!entity) {
        entity = await tx.userAiProfile.create({
          data: {
            userId,
            model,
            nameEncrypted: nameEncrypted ?? this.emptyNameEncrypted,
            imageUrlEncrypted: imageUrlEncrypted ?? this.emptyImageUrlEncrypted,
          },
          select: UserAiProfile.Select,
        });
      } else {
        if (imageUrlEncrypted) oldImageUrlEncrypted = entity.imageUrlEncrypted;

        entity = await tx.userAiProfile.update({
          where: { userId_model: { userId, model } },
          data: {
            nameEncrypted,
            imageUrlEncrypted,
          },
          select: UserAiProfile.Select,
        });
      }

      return { entity, oldImageUrlEncrypted };
    });

    const { entity, oldImageUrlEncrypted } = res;
    if (oldImageUrlEncrypted) {
      const oldImageUrl = this.service.encryption.decrypt(oldImageUrlEncrypted);
      if (oldImageUrl) {
        // delete old image
      }
    }

    const data = this.decrypt(entity);
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

      const oldImageUrlEncrypted = oldEntity.imageUrlEncrypted;
      const entity = await tx.userAiProfile.update({
        where: { userId_model: { userId, model } },
        data: { imageUrlEncrypted: this.emptyImageUrlEncrypted },
        select: UserAiProfile.Select,
      });

      return { oldImageUrlEncrypted, entity };
    });

    const { oldImageUrlEncrypted, entity } = res;
    if (oldImageUrlEncrypted) {
      const oldImageUrl = this.service.encryption.decrypt(oldImageUrlEncrypted);
      if (oldImageUrl) {
        // delete old image
      }
    }

    const data = this.decrypt(entity);
    return data;
  }
}

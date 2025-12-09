import type { Prisma } from "@/server/generated/prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { Model } from "./model";

export const UserAiProfileSelect = {
  id: true,
  model: true,
  nameEncrypted: true,
  imagePathEncrypted: true,
} satisfies Prisma.UserAiProfileSelect;

export const UserAiProfileId = z.number().int();
export type UserAiProfileId = zInfer<typeof UserAiProfileId>;

export const UserAiProfileEntity = z.object({
  get id() {
    return UserAiProfileId;
  },
  model: z.string(),
  nameEncrypted: z.string(),
  imagePathEncrypted: z.string(),
});
export type UserAiProfileEntity = zInfer<typeof UserAiProfileEntity>;

const _checkUserAiProfile = {} satisfies Omit<
  UserAiProfileEntity,
  keyof typeof UserAiProfileSelect
>;

export const UserAiProfileData = UserAiProfileEntity.omit({
  id: true,
  model: true,
  nameEncrypted: true,
  imagePathEncrypted: true,
}).extend({
  get model() {
    return Model;
  },
  name: z.string(),
  imageSource: z.string(),
});
export type UserAiProfileData = zInfer<typeof UserAiProfileData>;

export const UserAiProfileGet = z.object({
  get model() {
    return Model;
  },
});
export type UserAiProfileGet = zInfer<typeof UserAiProfileGet>;

export const UserAiProfileGetOutput = UserAiProfileData.nullable();
export type UserAiProfileGetOutput = zInfer<typeof UserAiProfileGetOutput>;

export const UserAiProfileGetAllOutput = UserAiProfileData.array();
export type UserAiProfileGetAllOutput = zInfer<
  typeof UserAiProfileGetAllOutput
>;

export const UserAiProfileDeleteImage = z.object({
  get model() {
    return Model;
  },
});
export type UserAiProfileDeleteImage = zInfer<typeof UserAiProfileDeleteImage>;

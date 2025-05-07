import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { UserAiProfileId } from "./id";
import { Model } from "./model";

export const UserAiProfileSelect = {
  id: true,
  model: true,
  nameEncrypted: true,
  imagePathEncrypted: true,
} satisfies Prisma.UserAiProfileSelect;

export const UserAiProfileEntity = z.object({
  id: UserAiProfileId,
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
  model: Model,
  name: z.string(),
  imageSource: z.string(),
});
export type UserAiProfileData = zInfer<typeof UserAiProfileData>;

export const UserAiProfileGet = z.object({
  model: Model,
});
export type UserAiProfileGet = zInfer<typeof UserAiProfileGet>;

export const UserAiProfileGetOutput = z.nullable(UserAiProfileData);
export type UserAiProfileGetOutput = zInfer<typeof UserAiProfileGetOutput>;

export const UserAiProfileGetAllOutput = z.array(UserAiProfileData);
export type UserAiProfileGetAllOutput = zInfer<
  typeof UserAiProfileGetAllOutput
>;

export const UserAiProfileDeleteImage = z.object({
  model: Model,
});
export type UserAiProfileDeleteImage = zInfer<typeof UserAiProfileDeleteImage>;

import { z } from "zod";
import type { zInfer } from "./common";
import { Model } from "./model";

export const UserAiProfileId = z.number().int();
export type UserAiProfileId = zInfer<typeof UserAiProfileId>;

export const UserAiProfileData = z.object({
  get id() {
    return UserAiProfileId;
  },
  model: z.string(),
  name: z.string(),
  imageSource: z.string(),
});
export type UserAiProfileData = zInfer<typeof UserAiProfileData>;

export const UserAiProfileListOutput = UserAiProfileData.array();
export type UserAiProfileListOutput = zInfer<typeof UserAiProfileListOutput>;

export const UserAiProfileDeleteImage = z.object({
  get model() {
    return Model;
  },
});
export type UserAiProfileDeleteImage = zInfer<typeof UserAiProfileDeleteImage>;

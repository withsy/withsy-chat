import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { UserAiProfileId } from "./id";
import { Model } from "./model";

export const Select = {
  id: true,
  model: true,
  nameEncrypted: true,
  imagePathEncrypted: true,
} satisfies Prisma.UserAiProfileSelect;

export const Entity = z.object({
  id: UserAiProfileId,
  model: z.string(),
  nameEncrypted: z.string(),
  imagePathEncrypted: z.string(),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Data = Entity.omit({
  id: true,
  model: true,
  nameEncrypted: true,
  imagePathEncrypted: true,
}).extend({
  model: Model,
  name: z.string(),
  imageUrl: z.string(),
});
export type Data = zInfer<typeof Data>;

export const Get = z.object({
  model: Model,
});
export type Get = zInfer<typeof Get>;

export const GetOutput = z.nullable(Data);
export type GetOutput = zInfer<typeof GetOutput>;

export const DeleteImage = z.object({
  model: Model,
});
export type DeleteImage = zInfer<typeof DeleteImage>;

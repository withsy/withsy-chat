import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { UserAiProfileId } from "./id";
import { Model } from "./model";

export const Select = {
  id: true,
  model: true,
  name: true,
  imageUrl: true,
} satisfies Prisma.UserAiProfileSelect;

export const Entity = z.object({
  id: UserAiProfileId,
  model: z.string(),
  name: z.string(),
  imageUrl: z.string(),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Data = Entity.omit({
  model: true,
}).extend({
  model: Model,
});
export type Data = zInfer<typeof Data>;

export const Update = z.object({
  model: Model,
  name: z.optional(z.string()),
  image: z.optional(z.instanceof(File)),
});
export type Update = zInfer<typeof Update>;

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey, UserPromptId } from "./id";

export const Select = {
  id: true,
  titleEncrypted: true,
  textEncrypted: true,
  isStarred: true,
  updatedAt: true,
} satisfies Prisma.UserPromptSelect;

export const Entity = z.object({
  id: UserPromptId,
  titleEncrypted: z.string(),
  textEncrypted: z.string(),
  isStarred: z.boolean(),
  updatedAt: z.date(),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Data = Entity.omit({
  titleEncrypted: true,
  textEncrypted: true,
}).extend({
  title: z.string(),
  text: z.string(),
});
export type Data = zInfer<typeof Data>;

export const Get = z.object({
  userPromptId: UserPromptId,
});
export type Get = zInfer<typeof Get>;

export const ListOutput = z.array(Data);
export type ListOutput = zInfer<typeof ListOutput>;

export const Create = z.object({
  idempotencyKey: IdempotencyKey,
  title: z.string(),
  text: z.string(),
});
export type Create = zInfer<typeof Create>;

export const Update = z.object({
  userPromptId: UserPromptId,
  title: z.string().optional(),
  text: z.string().optional(),
  isStarred: z.boolean(),
});
export type Update = zInfer<typeof Update>;

export const Delete = z.object({
  userPromptId: UserPromptId,
});
export type Delete = zInfer<typeof Delete>;

export const Restore = z.object({
  userPromptId: UserPromptId,
});
export type Restore = zInfer<typeof Restore>;

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey, UserPromptId } from "./id";

export const Select = {
  id: true,
  title: true,
  text: true,
  isStarred: true,
} satisfies Prisma.UserPromptSelect;

export const Schema = z.object({
  id: UserPromptId,
  title: z.string(),
  text: z.string(),
  isStarred: z.boolean(),
});
export type Schema = zInfer<typeof Schema>;
const _ = {} satisfies Omit<Schema, keyof typeof Select>;

export const Data = Schema.extend({});
export type Data = zInfer<typeof Data>;

export const Get = z.object({
  userPromptId: UserPromptId,
});
export type Get = zInfer<typeof Get>;

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

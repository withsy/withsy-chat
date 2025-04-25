import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { ChatStartOutput } from "./chat";
import type { zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";

export const PromptSelect = {
  id: true,
  title: true,
  text: true,
  isStarred: true,
  updatedAt: true,
} satisfies Prisma.PromptSelect;

export const PromptId = z.string().uuid();
export type PromptId = zInfer<typeof PromptId>;

export const PromptSchema = z.object({
  id: PromptId,
  title: z.string(),
  text: z.string(),
  isStarred: z.boolean(),
  updatedAt: z.date(),
});
export type PromptSchema = zInfer<typeof PromptSchema>;
const _ = {} satisfies Omit<PromptSchema, keyof typeof PromptSelect>;

export const Prompt = PromptSchema.extend({});
export type Prompt = zInfer<typeof Prompt>;

export const PromptCreate = z.object({
  title: z.string(),
  text: z.string(),
});
export type PromptCreate = zInfer<typeof PromptCreate>;

export const PromptGet = z.object({
  promptId: PromptId,
});
export type PromptGet = zInfer<typeof PromptGet>;

export const PromptList = z.object({});
export type PromptList = zInfer<typeof PromptList>;

export const PromptMetaSelect = {
  id: true,
  title: true,
  isStarred: true,
  updatedAt: true,
} satisfies Prisma.PromptSelect;

export const PromptMeta = z.object({
  id: PromptId,
  title: z.string(),
  isStarred: z.boolean(),
  updatedAt: z.date(),
});
export type PromptMeta = zInfer<typeof PromptMeta>;
const __ = {} satisfies Omit<PromptMeta, keyof typeof PromptMetaSelect>;

export const PromptUpdate = z.object({
  promptId: PromptId,
  title: z.string().optional(),
  text: z.string().optional(),
  isStarred: z.boolean().optional(),
});
export type PromptUpdate = zInfer<typeof PromptUpdate>;

export const PromptStart = z.object({
  idempotencyKey: IdempotencyKey,
  promptId: PromptId,
});
export type PromptStart = zInfer<typeof PromptStart>;

export const PromptStartOutput = z.lazy(() => ChatStartOutput);
export type PromptStartOutput = zInfer<typeof PromptStartOutput>;

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { IdempotencyKey, UserPromptId } from "./id";

export const UserPromptSelect = {
  id: true,
  titleEncrypted: true,
  textEncrypted: true,
  isStarred: true,
  updatedAt: true,
} satisfies Prisma.UserPromptSelect;

export const UserPromptEntity = z.object({
  id: UserPromptId,
  titleEncrypted: z.string(),
  textEncrypted: z.string(),
  isStarred: z.boolean(),
  updatedAt: z.date(),
});
export type UserPromptEntity = zInfer<typeof UserPromptEntity>;
const _checkUserPrompt = {} satisfies Omit<
  UserPromptEntity,
  keyof typeof UserPromptSelect
>;

export const UserPromptData = UserPromptEntity.omit({
  titleEncrypted: true,
  textEncrypted: true,
}).extend({
  title: z.string(),
  text: z.string(),
});
export type UserPromptData = zInfer<typeof UserPromptData>;

export const UserPromptGet = z.object({
  userPromptId: UserPromptId,
});
export type UserPromptGet = zInfer<typeof UserPromptGet>;

export const UserPromptListOutput = z.array(UserPromptData);
export type UserPromptListOutput = zInfer<typeof UserPromptListOutput>;

export const UserPromptCreate = z.object({
  idempotencyKey: IdempotencyKey,
  title: z.string(),
  text: z.string(),
});
export type UserPromptCreate = zInfer<typeof UserPromptCreate>;

export const UserPromptUpdate = z.object({
  userPromptId: UserPromptId,
  title: z.optional(z.string()),
  text: z.optional(z.string()),
  isStarred: z.optional(z.boolean()),
});
export type UserPromptUpdate = zInfer<typeof UserPromptUpdate>;

export const UserPromptDelete = z.object({
  userPromptId: UserPromptId,
});
export type UserPromptDelete = zInfer<typeof UserPromptDelete>;

export const UserPromptRestore = z.object({
  userPromptId: UserPromptId,
});
export type UserPromptRestore = zInfer<typeof UserPromptRestore>;

import type { Prisma } from "@/server/generated/prisma/client";
import { z } from "zod";
import { DateTimeTz, type zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";

export const UserPromptSelect = {
  id: true,
  titleEncrypted: true,
  textEncrypted: true,
  isStarred: true,
  updatedAt: true,
} satisfies Prisma.UserPromptSelect;

export const UserPromptId = z.uuid();
export type UserPromptId = zInfer<typeof UserPromptId>;

export const UserPromptEntity = z.object({
  get id() {
    return UserPromptId;
  },
  titleEncrypted: z.string(),
  textEncrypted: z.string(),
  isStarred: z.boolean(),
  get updatedAt() {
    return DateTimeTz;
  },
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
  get userPromptId() {
    return UserPromptId;
  },
});
export type UserPromptGet = zInfer<typeof UserPromptGet>;

export const UserPromptListOutput = UserPromptData.array();
export type UserPromptListOutput = zInfer<typeof UserPromptListOutput>;

export const UserPromptCreate = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
  title: z.string(),
  text: z.string(),
});
export type UserPromptCreate = zInfer<typeof UserPromptCreate>;

export const UserPromptUpdate = z.object({
  get userPromptId() {
    return UserPromptId;
  },
  title: z.string().optional(),
  text: z.string().optional(),
  isStarred: z.boolean().optional(),
});
export type UserPromptUpdate = zInfer<typeof UserPromptUpdate>;

export const UserPromptDelete = z.object({
  get userPromptId() {
    return UserPromptId;
  },
});
export type UserPromptDelete = zInfer<typeof UserPromptDelete>;

export const UserPromptRestore = z.object({
  get userPromptId() {
    return UserPromptId;
  },
});
export type UserPromptRestore = zInfer<typeof UserPromptRestore>;

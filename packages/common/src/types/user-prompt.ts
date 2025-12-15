import { z } from "zod";
import { DateTimeTz, type zInfer } from "./common";
import { IdempotencyKey } from "./idempotency";

export const UserPromptId = z.uuid();
export type UserPromptId = zInfer<typeof UserPromptId>;

export const UserPromptData = z.object({
  get id() {
    return UserPromptId;
  },
  title: z.string(),
  text: z.string(),
  isStarred: z.boolean(),
  get updatedAt() {
    return DateTimeTz;
  },
});
export type UserPromptData = zInfer<typeof UserPromptData>;

export const UserPromptGet = z.object({
  get userPromptId() {
    return UserPromptId;
  },
});
export type UserPromptGet = zInfer<typeof UserPromptGet>;

export const UserPromptList = z.object({
  limit: z.number().int().min(1).max(50).default(50),
  cursor: z.string().nullable().default(null),
});
export type UserPromptList = zInfer<typeof UserPromptList>;

export const UserPromptListOutput = z.object({
  get items() {
    return UserPromptData.array();
  },
  nextCursor: z.string().nullable().default(null),
});

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

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { UserPromptId } from "./id";
import { UserPromptData } from "./user-prompt";

export const UserDefaultPromptSelect = {
  userPromptId: true,
} satisfies Prisma.UserDefaultPromptSelect;

export const UserDefaultPromptEntity = z.object({
  userPromptId: z.nullable(UserPromptId),
});
export type UserDefaultPromptEntity = zInfer<typeof UserDefaultPromptEntity>;
const _checkUserDefaultPrompt = {} satisfies Omit<
  UserDefaultPromptEntity,
  keyof typeof UserDefaultPromptSelect
>;

export const UserDefaultPromptData = UserDefaultPromptEntity.extend({
  userPrompt: z.nullable(UserPromptData).default(null),
});
export type UserDefaultPromptData = zInfer<typeof UserDefaultPromptData>;

export const UserDefaultPromptGetOutput = z.nullable(UserDefaultPromptData);
export type UserDefaultPromptGetOutput = zInfer<
  typeof UserDefaultPromptGetOutput
>;

export const UserDefaultPromptUpdate = z.object({
  userPromptId: z.nullable(UserPromptId),
});
export type UserDefaultPromptUpdate = zInfer<typeof UserDefaultPromptUpdate>;

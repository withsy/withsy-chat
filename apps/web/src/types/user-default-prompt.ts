import type { Prisma } from "@/server/generated/prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { UserPromptData, UserPromptId } from "./user-prompt";

export const UserDefaultPromptSelect = {
  userPromptId: true,
} satisfies Prisma.UserDefaultPromptSelect;

export const UserDefaultPromptEntity = z.object({
  get userPromptId() {
    return UserPromptId.nullable();
  },
});
export type UserDefaultPromptEntity = zInfer<typeof UserDefaultPromptEntity>;

const _checkUserDefaultPrompt = {} satisfies Omit<
  UserDefaultPromptEntity,
  keyof typeof UserDefaultPromptSelect
>;

export const UserDefaultPromptData = UserDefaultPromptEntity.extend({
  get userPrompt() {
    return UserPromptData.nullable().default(null);
  },
});
export type UserDefaultPromptData = zInfer<typeof UserDefaultPromptData>;

export const UserDefaultPromptGetOutput = UserDefaultPromptData.nullable();
export type UserDefaultPromptGetOutput = zInfer<
  typeof UserDefaultPromptGetOutput
>;

export const UserDefaultPromptUpdate = z.object({
  get userPromptId() {
    return UserPromptId.nullable();
  },
});
export type UserDefaultPromptUpdate = zInfer<typeof UserDefaultPromptUpdate>;

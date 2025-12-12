import { z } from "zod";
import type { zInfer } from "./common";
import { UserPromptId } from "./user-prompt";

export const UserDefaultPromptData = z.object({
  get userPromptId() {
    return UserPromptId.nullable();
  },
});
export type UserDefaultPromptData = zInfer<typeof UserDefaultPromptData>;

export const UserDefaultPromptGetOutput = UserDefaultPromptData.nullable();
export type UserDefaultPromptGetOutput = zInfer<
  typeof UserDefaultPromptGetOutput
>;

export const UserDefaultPromptUpsert = z.object({
  get userPromptId() {
    return UserPromptId.nullable();
  },
});
export type UserDefaultPromptUpsert = zInfer<typeof UserDefaultPromptUpsert>;

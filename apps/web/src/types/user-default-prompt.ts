import { z } from "zod";
import type { zInfer } from "./common";
import { UserPromptData, UserPromptId } from "./user-prompt";

export const UserDefaultPromptData = z.object({
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

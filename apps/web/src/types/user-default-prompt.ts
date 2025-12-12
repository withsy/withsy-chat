import { z } from "zod";
import type { zInfer } from "./common";
import { UserPromptId } from "./user-prompt";

export const UserDefaultPromptData = z.object({
  get userPromptId() {
    return UserPromptId.nullable();
  },
});
export type UserDefaultPromptData = zInfer<typeof UserDefaultPromptData>;

export const UserDefaultPromptUpdate = z.object({
  get userPromptId() {
    return UserPromptId.nullable();
  },
});
export type UserDefaultPromptUpdate = zInfer<typeof UserDefaultPromptUpdate>;

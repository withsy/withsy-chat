import z from "zod";
import { UserPromptId } from "../user-prompt/user-prompt-schemas.js";

export const UserDefaultPromptData = z.object({
  get userPromptId() {
    return UserPromptId.nullable();
  },
});
export type UserDefaultPromptData = z.infer<typeof UserDefaultPromptData>;

export const UserDefaultPromptTryGetOutput = UserDefaultPromptData.nullable();
export type UserDefaultPromptTryGetOutput = z.infer<
  typeof UserDefaultPromptTryGetOutput
>;

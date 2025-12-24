import z from "zod";
import { UserPromptId } from "../user-prompt/user-prompt-schemas";

export const UserDefaultPromptData = z.object({
  get userPromptId() {
    return UserPromptId.nullable();
  },
});
export type UserDefaultPromptData = z.infer<typeof UserDefaultPromptData>;

import z from "zod";

export const UserPromptId = z.uuid();
export type UserPromptId = z.infer<typeof UserPromptId>;

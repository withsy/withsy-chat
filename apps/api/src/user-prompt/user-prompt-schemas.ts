import z from "zod";
import { createListSchemas } from "../common-schemas";

export const UserPromptId = z.uuid();
export type UserPromptId = z.infer<typeof UserPromptId>;

export const UserPromptData = z.object({});
export type UserPromptData = z.infer<typeof UserPromptData>;

const userPromptListSchemas = createListSchemas(UserPromptData);

export const UserPromptList = userPromptListSchemas.list;
export type UserPromptList = z.infer<typeof UserPromptList>;

export const UserPromptListOutput = userPromptListSchemas.listOutput;
export type UserPromptListOutput = z.infer<typeof UserPromptListOutput>;

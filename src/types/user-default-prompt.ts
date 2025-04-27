import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { UserPrompt } from ".";
import type { zInfer } from "./common";
import { UserPromptId } from "./id";

export const Select = {
  userPromptId: true,
} satisfies Prisma.UserDefaultPromptSelect;

export const Schema = z.object({
  userPromptId: UserPromptId,
});
export type Schema = zInfer<typeof Schema>;
const _ = {} satisfies Omit<Schema, keyof typeof Select>;

export const Data = Schema.extend({
  userPrompt: UserPrompt.Data.nullable().default(null),
});
export type Data = zInfer<typeof Data>;

export const GetOutput = Data.nullable();
export type GetOutput = zInfer<typeof GetOutput>;

export const Update = z.object({
  userPromptId: UserPromptId,
});
export type Update = zInfer<typeof Update>;

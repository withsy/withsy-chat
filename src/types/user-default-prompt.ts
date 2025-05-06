import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";
import { UserPromptId } from "./id";
import * as UserPrompt from "./user-prompt";

export const Select = {
  userPromptId: true,
} satisfies Prisma.UserDefaultPromptSelect;

export const Entity = z.object({
  userPromptId: z.nullable(UserPromptId),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export const Data = Entity.extend({
  userPrompt: z.nullable(UserPrompt.Data).default(null),
});
export type Data = zInfer<typeof Data>;

export const GetOutput = z.nullable(Data);
export type GetOutput = zInfer<typeof GetOutput>;

export const Update = z.object({
  userPromptId: z.nullable(UserPromptId),
});
export type Update = zInfer<typeof Update>;

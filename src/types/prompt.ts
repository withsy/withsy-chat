import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { zInfer } from "./common";

export const PromptSelect = { id: true } satisfies Prisma.PromptSelect;

export const PromptSchema = z.object({});
export type PromptSchema = zInfer<typeof PromptSchema>;
const _ = {} satisfies Omit<PromptSchema, keyof typeof PromptSelect>;

export const Prompt = PromptSchema.extend({
  text: z.string().optional(),
});
export type Prompt = zInfer<typeof Prompt>;

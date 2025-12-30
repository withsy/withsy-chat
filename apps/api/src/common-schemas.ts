import { Model } from "@repo/common";
import z from "zod";

//#region Utils

export const DateTimeTz = z.coerce.date<Date | string>();
export type DateTimeTz = Date;

export function createListSchemas<T extends z.ZodType>(
  itemSchema: T,
  options?: {
    limitMin?: number;
    limitMax?: number;
    limitDefault?: number;
  },
) {
  const { limitMin = 1, limitMax = 20, limitDefault = 20 } = options ?? {};

  const list = z.object({
    limit: z.number().int().min(limitMin).max(limitMax).default(limitDefault),
    cursor: z.string().nullable().default(null),
    direction: z.enum(["forward", "backward"]).default("forward"),
  });

  const listOutput = z.object({
    get items() {
      return itemSchema.array();
    },
    nextCursor: z.string().nullable().default(null),
  });

  return {
    list,
    listOutput,
  };
}

export const Order = z.enum(["asc", "desc"]);
export type Order = z.infer<typeof Order>;

//#endregion Utils

//#region Ai

export const ModelProvider = z.enum(["google-gen-ai", "xai"]);
export type ModelProvider = z.infer<typeof ModelProvider>;

export const ModelProviderMap = {
  "gemini-2.5-flash": "google-gen-ai",
  "grok-3": "xai",
  "grok-3-mini": "xai",
  "grok-3-mini-fast": "xai",
} satisfies Record<Model, ModelProvider>;
export type ModelProviderMap = typeof ModelProviderMap;

export const Role = z.enum(["user", "model", "system"]);
export type Role = z.infer<typeof Role>;

export const GoogleGenAiRole = z.enum(["user", "model"]);
export type GoogleGenAiRole = z.infer<typeof GoogleGenAiRole>;

export const GoogleGenAiRoleMap = {
  user: "user",
  model: "model",
  system: "user",
} satisfies Record<Role, GoogleGenAiRole>;
export type GoogleGenAiRoleMap = typeof GoogleGenAiRoleMap;

export const OpenAiRole = z.enum(["user", "assistant", "system"]);
export type OpenAiRole = z.infer<typeof OpenAiRole>;

export const OpenAiRoleMap = {
  user: "user",
  model: "assistant",
  system: "system",
} satisfies Record<Role, OpenAiRole>;
export type OpenAiRoleMap = z.infer<typeof OpenAiRoleMap>;

export interface AiSendTextInput {
  model: Model;
  prompt: string;
  texts: { role: string; text: string }[];
}

export interface AiSendTextOutput {
  text: string;
  reasoningText: string;
  rawData: string;
}

export interface AiSendTextService {
  sendText(input: AiSendTextInput): AsyncIterable<AiSendTextOutput>;
}

//#endregion Ai

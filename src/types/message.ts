import type { Prisma } from "@prisma/client";
import { z } from "zod";
import * as Chat from "./chat";
import { type zInfer } from "./common";
import { ChatId, IdempotencyKey, MessageId, UserId } from "./id";
import { Model } from "./model";
import { Role } from "./role";
import * as UserUsageLimit from "./user-usage-limit";

export const Select = {
  id: true,
  chatId: true,
  role: true,
  model: true,
  textEncrypted: true,
  reasoningTextEncrypted: true,
  status: true,
  isBookmarked: true,
  parentMessageId: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

export const Status = z.enum(["pending", "processing", "succeeded", "failed"]);
export type Status = zInfer<typeof Status>;

export function isComplete(data: Data) {
  return data.status === "succeeded" || data.status === "failed";
}

export const Entity = z.object({
  id: MessageId,
  chatId: ChatId,
  role: z.string(),
  model: z.nullable(z.string()),
  textEncrypted: z.string(),
  reasoningTextEncrypted: z.string(),
  status: Status,
  isBookmarked: z.boolean(),
  parentMessageId: z.nullable(MessageId),
  createdAt: z.date(),
});
export type Entity = zInfer<typeof Entity>;
const _ = {} satisfies Omit<Entity, keyof typeof Select>;

export type Data = {
  id: MessageId;
  chatId: ChatId;
  chat?: Chat.Data | null;
  role: Role;
  model: Model | null;
  text: string;
  reasoningText: string;
  status: Status;
  isBookmarked: boolean;
  createdAt: Date;
  parentMessageId: MessageId | null;
  parentMessage?: Data | null;
};
export const DataBase: z.ZodType<Data> = Entity.omit({
  textEncrypted: true,
  reasoningTextEncrypted: true,
  role: true,
  model: true,
}).extend({
  text: z.string(),
  reasoningText: z.string(),
  role: Role,
  model: z.nullable(Model),
  chat: z.nullable(z.lazy(() => Chat.Data)).default(null),
  parentMessage: z.nullable(z.lazy(() => DataBase)).default(null),
});
export const Data = DataBase;

export const Get = z.object({
  messageId: MessageId,
});
export type Get = zInfer<typeof Get>;

export const GetOutput = z.nullable(Data);
export type GetOutput = zInfer<typeof GetOutput>;

export const List = z.object({
  role: z.optional(Role),
  isBookmarked: z.optional(z.boolean()),
  options: z.object({
    scope: z.discriminatedUnion("by", [
      z.object({ by: z.literal("user"), userId: UserId }),
      z.object({ by: z.literal("chat"), chatId: ChatId }),
    ]),
    order: z.optional(z.enum(["asc", "desc"])).default("asc"),
    limit: z.optional(z.number().int().min(1).max(100)).default(100),
    afterId: z.optional(MessageId),
    include: z.optional(
      z.object({
        chat: z.optional(z.boolean()).default(false),
      })
    ),
  }),
});
export type List = zInfer<typeof List>;

export const ListOutput = z.array(Data);
export type ListOutput = zInfer<typeof ListOutput>;

export type EntityForAi = {
  role: string;
  textEncrypted: string;
};

export type DataForAi = {
  role: string;
  text: string;
};

export const Send = z.object({
  idempotencyKey: IdempotencyKey,
  chatId: ChatId,
  text: z.string(),
  model: Model,
});
export type Send = zInfer<typeof Send>;

export const SendOutput = z.object({
  userMessage: Data,
  modelMessage: Data,
});
export type SendOutput = zInfer<typeof SendOutput>;

export const SendError = UserUsageLimit.Error;

export const Update = z.object({
  messageId: MessageId,
  isBookmarked: z.optional(z.boolean()),
});
export type Update = zInfer<typeof Update>;

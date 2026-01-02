import type { TrpcOptions } from "@/lib/trpc";
import { RawUserPreferences } from "@repo/common";
import type { inferInput, inferOutput } from "@trpc/tanstack-react-query";
import type { Session } from "next-auth";
import z from "zod";

export type PartialUserPreferences = NonNullable<
  inferInput<TrpcOptions["user"]["update"]>["preferences"]
>;

export type UserPreferences = Required<PartialUserPreferences>;

export type UserPreferenceKey = keyof UserPreferences;

export type UserData = inferOutput<TrpcOptions["userServer"]["get"]>;

export interface AuthSession extends Session {
  user: Session["user"] & UserData;
}

export const AuthSession = z.object({
  user: z.object({
    id: z.string(),
    preferences: RawUserPreferences,
  }),
});

export type ChatData = inferOutput<TrpcOptions["chat"]["list"]>["items"][0];

export type ChatDataKey = keyof ChatData;

export type ChatId = ChatData["id"];

export type ChatMessageData = inferOutput<
  TrpcOptions["chatMessage"]["list"]
>["items"][0];

export type ChatMessageId = ChatMessageData["id"];

export interface ChatMessageInfo extends ChatMessageData {
  isCollapsed: boolean;
}

export type ChatMessageInfoKey = keyof ChatMessageInfo;

export type Order = NonNullable<
  inferInput<TrpcOptions["chatMessage"]["list"]>["order"]
>;

export type UserPromptData = inferOutput<
  TrpcOptions["userPrompt"]["list"]
>["items"][0];

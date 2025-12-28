import type { TrpcOptions } from "@/lib/trpc";
import { RawUserPreferences } from "@repo/common";
import type { inferInput, inferOutput } from "@trpc/tanstack-react-query";
import type { Session } from "next-auth";
import type { Simplify } from "type-fest";
import z from "zod";

export type UserData = inferOutput<TrpcOptions["user"]["get"]>;

export interface AuthSession extends Session {
  user: Session["user"] & UserData;
}

export const AuthSession = z.object({
  user: z.object({
    id: z.string(),
    preferences: RawUserPreferences,
  }),
});

export type UserPreferences = Simplify<
  NonNullable<
    Required<inferInput<TrpcOptions["user"]["update"]>["preferences"]>
  >
>;

export type PartialUserPreferences = Partial<UserPreferences>;

export type UserPreferenceKey = keyof PartialUserPreferences;

export type ChatData = inferOutput<TrpcOptions["chat"]["list"]>["items"][0];

export type ChatId = ChatData["id"];

export type ChatMessageData = inferOutput<
  TrpcOptions["chatMessage"]["list"]
>["items"][0];

export type ChatMessageId = ChatMessageData["id"];

export interface ChatMessageInfo extends ChatMessageData {
  isMessageCollapsed: boolean;
}

export type UserPromptData = inferOutput<
  TrpcOptions["userPrompt"]["list"]
>["items"][0];

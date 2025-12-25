import type { TrpcOptions } from "@/lib/trpc";
import { RawUserPreferences } from "@repo/common";
import type { inferInput, inferOutput } from "@trpc/tanstack-react-query";
import type { Session } from "next-auth";
import type { Simplify } from "type-fest";
import z from "zod";

export interface AuthSession extends Session {
  user: Session["user"] & {
    id: string;
    rawPreferences: RawUserPreferences;
  };
}

export const AuthSession = z.object({
  user: z.object({
    id: z.string(),
    rawPreferences: RawUserPreferences,
  }),
});

export type Preferences = Simplify<
  Required<inferInput<TrpcOptions["user"]["updatePreferences"]>>
>;

export type PartialUserPreferences = Partial<Preferences>;

export type UserPreferenceKey = keyof PartialUserPreferences;

export type ChatData = inferOutput<TrpcOptions["chat"]["list"]>["items"][0];

export type MessageData = inferOutput<
  TrpcOptions["message"]["list"]
>["items"][0];

export type UserPromptData = inferOutput<
  TrpcOptions["userPrompt"]["list"]
>["items"][0];

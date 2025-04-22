import type { AppRouter } from "@/server/trpc/routers/_app";
import {
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

export type TrpcRouterInput = inferRouterInputs<AppRouter>;
export type TrpcRouterOutput = inferRouterOutputs<AppRouter>;

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}`;
}

function getUrl() {
  return `${getBaseUrl()}/api/trpc`;
}

export const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  config() {
    return {
      links: [
        process.env.NODE_ENV !== "production" ? loggerLink() : null,
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            transformer: superjson,
            url: getUrl(),
          }),
          false: httpBatchLink({
            transformer: superjson,
            url: getUrl(),
          }),
        }),
      ].filter((x) => x != null),
    };
  },
  ssr: false,
});

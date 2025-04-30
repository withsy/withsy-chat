import type { AppRouter } from "@/server/trpc/routers/_app";
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
  type TRPCLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}`;
}

function getUrl() {
  return `${getBaseUrl()}/api/trpc`;
}

const links: TRPCLink<AppRouter>[] = [
  loggerLink({
    enabled: (opts) =>
      (process.env.NODE_ENV === "development" &&
        typeof window !== "undefined") ||
      (opts.direction === "down" && opts.result instanceof Error),
  }),
  splitLink({
    condition: (op) => op.type === "subscription",
    true: httpSubscriptionLink({
      transformer: superjson,
      url: getUrl(),
    }),
    false: splitLink({
      condition: (op) => op.context.skipBatch === true,
      true: httpLink({
        transformer: superjson,
        url: getUrl(),
      }),
      false: httpBatchLink({
        transformer: superjson,
        url: getUrl(),
      }),
    }),
  }),
];

export const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  config() {
    return {
      links,
    };
  },
  ssr: false,
});

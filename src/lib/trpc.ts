import type { AppRouter } from "@/server/trpc/routers/_app";
import {
  httpBatchLink,
  httpLink,
  httpSubscriptionLink,
  isNonJsonSerializable,
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

const commonLinkOptions = {
  transformer: superjson,
  url: getUrl(),
};

const links: TRPCLink<AppRouter>[] = [
  loggerLink({
    enabled: (opts) =>
      (process.env.NODE_ENV === "development" &&
        typeof window !== "undefined") ||
      (opts.direction === "down" && opts.result instanceof Error),
  }),
  splitLink({
    condition: (op) => op.type === "subscription",
    true: httpSubscriptionLink(commonLinkOptions),
    false: splitLink({
      condition: (op) =>
        op.context.skipBatch === true || isNonJsonSerializable(op.input),
      true: httpLink(commonLinkOptions),
      false: httpBatchLink(commonLinkOptions),
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

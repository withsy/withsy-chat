import type { AppRouter } from "@repo/api";
import {
  createTRPCClient,
  httpLink,
  loggerLink,
  type TRPCClient,
} from "@trpc/client";
import type { EnvVars } from "./env-vars";

export function createTrpcClient(envVars: EnvVars): TRPCClient<AppRouter> {
  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      // TODO: Log only the necessary information.
      loggerLink({
        enabled: (opts) =>
          envVars.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpLink({
        url: `${envVars.NEXT_PUBLIC_API_URL}/trpc`,
        headers: {
          "X-Api-Key": envVars.API_KEY,
        },
      }),
    ],
  });

  return trpcClient;
}

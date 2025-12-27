import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "../../web/dist/src/server/app/app.router";

export function createTrpcClient() {
  const { API_URL, API_KEY } = process.env;
  if (!API_URL) {
    throw new Error("Invalid API_URL.");
  }

  let apiUrl = API_URL;
  if (apiUrl.endsWith("/")) {
    apiUrl = apiUrl.slice(0, -1);
  }

  if (!API_KEY) {
    throw new Error("Invalid API_KEY.");
  }

  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${apiUrl}/api/trpc`,
        headers: {
          "X-Api-Key": API_KEY,
        },
      }),
    ],
  });

  return trpcClient;
}

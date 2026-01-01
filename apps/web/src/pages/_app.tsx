import { FullPageError } from "@/components/Error";
import { UserProvider } from "@/features/user/contexts/UserContext";
import { useSidebarInitializer } from "@/hooks/useSidebarInitializer";
import { getQueryClient } from "@/lib/query-client";
import { createTrpcClient, TRPCProvider } from "@/lib/trpc";
import "@/styles/globals.css";
import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { enableMapSet } from "immer";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster as Sonner } from "sonner";

enableMapSet();

function createTitle(): string {
  let title = "Withsy";
  if (process.env.NODE_ENV === "development") {
    title = `[DEV] ${title}`;
  }

  return title;
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  useSidebarInitializer();
  const [trpcClient] = useState(() => createTrpcClient());
  const queryClient = getQueryClient();
  const title = createTitle();

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary onReset={reset} fallbackRender={FullPageError}>
              <SessionProvider
                session={session}
                refetchOnWindowFocus={false}
                refetchWhenOffline={false}
              >
                <UserProvider>
                  <Head>
                    <link rel="icon" href="/favicon.ico" />
                    <title>{title}</title>
                  </Head>
                  <Component {...pageProps} />
                  <Sonner position="bottom-right" />
                  <ReactQueryDevtools />
                </UserProvider>
              </SessionProvider>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

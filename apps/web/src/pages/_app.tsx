import { UserProvider } from "@/contexts/UserContext";
import { useSidebarInitializer } from "@/hooks/useSidebarInitializer";
import { createTrpcClient, getQueryClient, TRPCProvider } from "@/lib/trpc";
import "@/styles/globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { enableMapSet } from "immer";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import { Toaster as Sonner } from "sonner";

enableMapSet();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  useSidebarInitializer();
  const [trpcClient] = useState(() => createTrpcClient());
  const queryClient = getQueryClient();

  let title = "Withsy";
  if (process.env.NODE_ENV === "development") {
    title = `[DEV] ${title}`;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
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
      </TRPCProvider>
    </QueryClientProvider>
  );
}

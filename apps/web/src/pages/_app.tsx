// import TermlyCMP from "@/components/TermlyCMP";
import { useSidebarInitializer } from "@/hooks/useSidebarInitializer";
import { createTrpcClient, getQueryClient, TRPCProvider } from "@/lib/trpc";
import "@/styles/globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import { Toaster as Sonner } from "sonner";

// const WEBSITE_UUID = "7ad995d7-f4f8-4a3d-837b-335895e58c1b";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  useSidebarInitializer();

  let title = "Withsy";
  if (process.env.NODE_ENV === "development") {
    title = `[DEV] ${title}`;
  }

  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => createTrpcClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <SessionProvider session={session} refetchOnWindowFocus={false}>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <title>{title}</title>
          </Head>
          <Component {...pageProps} />
          {/* <TermlyCMP
            websiteUUID={WEBSITE_UUID}
            autoBlock={undefined}
            masterConsentsOrigin={undefined}
          /> */}
          <Sonner position="bottom-right" />
          <ReactQueryDevtools />
        </SessionProvider>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

import ChatLayout from "@/components/layout/ChatLayout";
import HomeLayout from "@/components/layout/HomeLayout";
import LoadAiProfiles from "@/components/LoadAiProfiles";
import TermlyCMP from "@/components/TermlyCMP";
import AppProviders from "@/context/AppProviders";
import { useSidebarInitializer } from "@/hooks/useSidebarInitializer";
import { createTrpcClient, getQueryClient, TRPCProvider } from "@/lib/trpc";
import "@/styles/globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { Nunito } from "next/font/google";
import Head from "next/head";
import { useState } from "react";
import { Toaster as Sonner } from "sonner";

const WEBSITE_UUID = "7ad995d7-f4f8-4a3d-837b-335895e58c1b";
const nunito = Nunito({ subsets: ["latin"] });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  useSidebarInitializer();
  let title = "Withsy";
  if (process.env.NODE_ENV === "development") title = `[DEV] ${title}`;

  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => createTrpcClient());

  const layoutType = (Component as any).layoutType ?? "none";
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <AppProviders session={session}>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <title>{title}</title>
          </Head>
          {layoutType == "none" ? (
            <main className={nunito.className}>
              <Component {...pageProps} />
            </main>
          ) : layoutType == "home" ? (
            <HomeLayout className={nunito.className}>
              <Component {...pageProps} />
            </HomeLayout>
          ) : (
            <ChatLayout className={nunito.className}>
              <LoadAiProfiles />
              <Component {...pageProps} />
            </ChatLayout>
          )}

          <TermlyCMP
            websiteUUID={WEBSITE_UUID}
            autoBlock={undefined}
            masterConsentsOrigin={undefined}
          />
          <Sonner position="bottom-right" />
          <ReactQueryDevtools />
        </AppProviders>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

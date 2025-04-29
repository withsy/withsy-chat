import Layout from "@/components/layout/Layout";
import AppProviders from "@/context/AppProviders";
import { useSidebarInitializer } from "@/hooks/useSidebarInitializer";
import { trpc } from "@/lib/trpc";
import "@/styles/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps, AppType } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster as Sonner } from "sonner";

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  useSidebarInitializer();
  const router = useRouter();
  const noLayoutPages = ["/auth/signin", "/"];
  const isLayoutDisabled = noLayoutPages.includes(router.pathname);
  let title = "Withsy";
  if (process.env.NODE_ENV === "development") title = `[DEV] ${title}`;

  return (
    <AppProviders session={session}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>{title}</title>
      </Head>
      {isLayoutDisabled ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
      <Sonner position="bottom-right" />
      <ReactQueryDevtools />
    </AppProviders>
  );
};

export default trpc.withTRPC(MyApp);

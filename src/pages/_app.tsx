import AppProviders from "@/context/AppProviders";
import { useSidebarInitializer } from "@/hooks/useSidebarInitializer";
import { trpc } from "@/lib/trpc";
import "@/styles/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps, AppType } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster as Sonner } from "sonner";
import { Nunito } from "next/font/google";
import ChatLayout from "@/components/layout/ChatLayout";
import HomeLayout from "@/components/layout/HomeLayout";

const nunito = Nunito({ subsets: ["latin"] });

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  useSidebarInitializer();
  const router = useRouter();
  const noLayoutPages = ["/auth/signin"];
  const homeLayoutPages = [
    "/",
    "/about",
    "/docs",
    "/roadmap",
    "/blog",
    "/contact",
  ];
  const isLayoutDisabled = noLayoutPages.includes(router.pathname);
  const isHomeLayout = homeLayoutPages.includes(router.pathname);
  let title = "Withsy";
  if (process.env.NODE_ENV === "development") title = `[DEV] ${title}`;

  return (
    <AppProviders session={session}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>{title}</title>
      </Head>
      {isLayoutDisabled ? (
        <main className={nunito.className}>
          <Component {...pageProps} />
        </main>
      ) : isHomeLayout ? (
        <HomeLayout className={nunito.className}>
          <Component {...pageProps} />
        </HomeLayout>
      ) : (
        <ChatLayout className={nunito.className}>
          <Component {...pageProps} />
        </ChatLayout>
      )}

      <Sonner position="bottom-right" />
      <ReactQueryDevtools />
    </AppProviders>
  );
};

export default trpc.withTRPC(MyApp);

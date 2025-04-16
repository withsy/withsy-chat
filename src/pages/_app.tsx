import Layout from "@/components/layout/Layout";
import AppProviders from "@/context/AppProviders";
import { trpc } from "@/lib/trpc";
import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { Toaster as Sonner } from "sonner";

const App: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  return (
    <AppProviders session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Sonner position="bottom-right" />
    </AppProviders>
  );
};

export default trpc.withTRPC(App);

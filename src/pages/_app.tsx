import { FullPageError } from "@/components/Error";
import Layout from "@/components/layout/Layout";
import { FullPageLoading } from "@/components/Loading";
import AppProviders from "@/context/AppProviders";
import { trpc } from "@/lib/trpc";
import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { Toaster as Sonner } from "sonner";

const App: AppType = ({ Component, pageProps }: AppProps) => {
  const userMe = trpc.user.me.useQuery();

  if (userMe.isLoading) return <FullPageLoading />;
  if (userMe.isError || !userMe.data)
    return <FullPageError message="loading user" />;

  return (
    <AppProviders userMe={userMe.data}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Sonner position="bottom-right" />
    </AppProviders>
  );
};

export default trpc.withTRPC(App);

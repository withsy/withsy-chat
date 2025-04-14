import Layout from "@/components/layout/Layout";
import Loading from "@/components/Loading";
import AppProviders from "@/context/AppProviders";
import { SidebarProvider } from "@/context/SidebarContext";
import { trpc } from "@/lib/trpc";
import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { Toaster as Sonner } from "sonner";

const App: AppType = ({ Component, pageProps }: AppProps) => {
  const userMe = trpc.user.me.useQuery();

  // TODO: Add loading and error page.
  if (userMe.isLoading) return <Loading />;
  if (userMe.isError || !userMe.data) return <div>Error loading user</div>;

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

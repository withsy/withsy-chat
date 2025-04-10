import Layout from "@/components/layout/Layout";
import { SidebarProvider } from "@/context/SidebarContext";
import { trpc } from "@/lib/trpc";
import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { Toaster as Sonner } from "sonner";

const App: AppType = ({ Component, pageProps }: AppProps) => {
  const userMe = trpc.user.me.useQuery();

  // TODO: Add loading and error page.
  if (userMe.isLoading) return <div>Loading...</div>;
  if (userMe.isError || !userMe.data) return <div>Error loading user</div>;

  return (
    <SidebarProvider userMe={userMe.data}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Sonner position="bottom-right" />
    </SidebarProvider>
  );
};

export default trpc.withTRPC(App);

import { SidebarProvider } from "@/context/SidebarContext";
import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { trpc } from "@/utils/trpc";
import Layout from "@/components/layout/Layout";

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
    </SidebarProvider>
  );
};

export default trpc.withTRPC(App);

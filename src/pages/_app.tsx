import { SidebarProvider } from "@/context/SidebarContext";
import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { trpc } from "../utils/trpc";
import Layout from "./components/Layout";

const App: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <SidebarProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SidebarProvider>
  );
};

export default trpc.withTRPC(App);

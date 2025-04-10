import Layout from "@/components/layout/Layout";
import { SidebarProvider } from "@/context/SidebarContext";
import { trpc } from "@/lib/trpc";
import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";

const App: AppType = ({ Component, pageProps }: AppProps) => {
  const userMe = trpc.user.me.useQuery();

  const startChatMut = trpc.chat.start.useMutation();
  const sendChatMessageMut = trpc.chatMessage.send.useMutation();
  const [chatMessageId, setChatMessageId] = useState("");
  const receiveChatMessageSub = trpc.chatMessage.receive.useSubscription(
    { chatMessageId },
    {
      enabled: !!chatMessageId,
      onData(data) {
        console.log(data.content);
      },
    }
  );

  useEffect(() => {
    startChatMut.mutate(
      { content: "hello", model: "gpt" },
      {
        onSuccess(data, variables, context) {
          sendChatMessageMut.mutate(
            { chatId: data.chat.id, model: "gpt", content: "Hello" },
            {
              onSuccess(data, variables, context) {
                setChatMessageId(data.id);
              },
            }
          );
        },
      }
    );
  }, []);

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

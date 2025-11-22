import { ChatSession } from "@/components/chat/ChatSession";
import { useTRPC } from "@/lib/trpc";
import { useChatStore } from "@/stores/useChatStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PartialError } from "../Error";
import { PartialLoading } from "../Loading";

type Props = {
  chatId: string;
};

export default function ChatView({ chatId }: Props) {
  const router = useRouter();
  const trpc = useTRPC();
  const chatGet = useQuery(trpc.chat.get.queryOptions({ chatId }));
  const messageList = useQuery(
    trpc.message.list.queryOptions({
      options: { scope: { by: "chat", chatId } },
    })
  );
  const setChat = useChatStore((state) => state.setChat);
  useEffect(() => {
    if (chatGet.data) {
      setChat(chatGet.data);
    }
  }, [chatGet.data, setChat]);

  useEffect(() => {
    if (!chatGet.error) return;
    if (!chatGet.error.shape) return;
    if (chatGet.error.shape.code === -32004 /* Not Found */)
      router.push("/chat");
  }, [chatGet.error, router]);

  if (chatGet.isLoading) return <PartialLoading />;
  if (chatGet.isError || !chatGet.data)
    return <PartialError message="Loading Chat" />;

  if (messageList.isLoading) return <PartialLoading />;
  if (messageList.isError || !messageList.data)
    return <PartialError message="Loading Messages" />;

  return <ChatSession initialMessages={messageList.data} />;
}

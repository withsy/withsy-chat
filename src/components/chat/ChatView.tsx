import { ChatSession } from "@/components/chat/ChatSession";
import { trpc } from "@/lib/trpc";
import { PartialError } from "../Error";
import { PartialLoading } from "../Loading";

type Props = {
  chatId: string;
};

export default function ChatView({ chatId }: Props) {
  const chatGet = trpc.chat.get.useQuery({ chatId });
  const messageList = trpc.message.list.useQuery({
    options: { scope: { by: "chat", chatId } },
  });

  if (chatGet.isLoading) return <PartialLoading />;
  if (chatGet.isError || !chatGet.data)
    return <PartialError message="Loading Chat" />;

  if (messageList.isLoading) return <PartialLoading />;
  if (messageList.isError || !messageList.data)
    return <PartialError message="Loading Messages" />;

  return <ChatSession chat={chatGet.data} initialMessages={messageList.data} />;
}

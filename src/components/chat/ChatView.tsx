import { ChatSession } from "@/components/chat/ChatSession";
import { trpc } from "@/lib/trpc";
import { PartialError } from "../Error";
import { PartialLoading } from "../Loading";

type Props = {
  chatId: string;
};

export default function ChatView({ chatId }: Props) {
  const listChatMessages = trpc.chatMessage.list.useQuery({
    options: { scope: { by: "chat", chatId } },
  });
  if (listChatMessages.isLoading) return <PartialLoading />;
  if (listChatMessages.isError || !listChatMessages.data)
    return <PartialError message="Loading Messages" />;

  return (
    <ChatSession chatId={chatId} initialMessages={listChatMessages.data} />
  );
}

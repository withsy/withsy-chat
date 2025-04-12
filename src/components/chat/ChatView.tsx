import { ChatSession } from "@/components/chat/ChatSession";
import { trpc } from "@/lib/trpc";

type Props = {
  chatId: string;
};

export default function ChatView({ chatId }: Props) {
  const listChatMessages = trpc.chatMessage.list.useQuery({ chatId });

  if (listChatMessages.isLoading) return <div>Loading...</div>;
  if (listChatMessages.isError || !listChatMessages.data)
    return <div>Error loading chat</div>;

  return (
    <ChatSession chatId={chatId} initialMessages={listChatMessages.data} />
  );
}

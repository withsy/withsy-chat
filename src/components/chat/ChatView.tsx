import { ChatSession } from "@/components/chat/ChatSession";
import { trpc } from "@/lib/trpc";
import { ChatMessage } from "@/types/chat";
import Loading from "../Loading";

type Props = {
  chatId: string;
};

export default function ChatView({ chatId }: Props) {
  const listChatMessages = trpc.chatMessage.list.useQuery({
    options: { scope: { by: "chat", chatId } },
  });

  if (listChatMessages.isLoading) return <Loading />;
  if (listChatMessages.isError || !listChatMessages.data)
    return <div>Error loading chat</div>;

  return (
    <ChatSession
      chatId={chatId}
      initialMessages={listChatMessages.data.map((v) => ChatMessage.parse(v))}
    />
  );
}

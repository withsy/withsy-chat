import { ChatSessionPage } from "@/components/chat/ChatSessionPage";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";

type Props = {
  chatId: string;
  chatMessageId?: number;
};

export default function ChatView({ chatId, chatMessageId = 0 }: Props) {
  const listChatMessages = trpc.chat.listMessages.useQuery(
    chatId ? { chatId } : skipToken
  );

  if (!chatId) {
    return <div>Loading or Invalid params...</div>;
  }

  if (listChatMessages.isLoading) return <div>Loading...</div>;
  if (listChatMessages.isError || !listChatMessages.data)
    return <div>Error loading chat</div>;

  return (
    <ChatSessionPage
      chatId={chatId}
      initialMessages={listChatMessages.data}
      initialAiChatMessageId={chatMessageId}
    />
  );
}

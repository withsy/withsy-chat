import { ChatSessionPage } from "@/components/chat/ChatSessionPage";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/router";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const chatId = typeof id === "string" ? id : null;
  const chatMessageId =
    typeof router.query.chatMessageId === "string"
      ? Number(router.query.chatMessageId)
      : 0;

  const listChatMessages = trpc.chat.listMessages.useQuery(
    chatId ? { chatId } : skipToken
  );

  if (chatId == null) {
    return <div>Loading or Invalid params...</div>;
  }

  // TODO: Add loading and error page.
  if (listChatMessages.isLoading) return <div>Loading...</div>;
  if (listChatMessages.isError || !listChatMessages.data)
    return <div>Error loading user</div>;

  return (
    <ChatSessionPage
      chatId={chatId}
      initialMessages={listChatMessages.data}
      initialAiChatMessageId={chatMessageId}
    />
  );
}

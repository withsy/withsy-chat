import { ChatSessionPage } from "@/components/chat/ChatSessionPage";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/router";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") return null;

  const listChatMessages = trpc.chatMessage.list.useQuery({ chatId: id });

  // TODO: Add loading and error page.
  if (listChatMessages.isLoading) return <div>Loading...</div>;
  if (listChatMessages.isError || !listChatMessages.data)
    return <div>Error loading user</div>;

  return (
    <ChatSessionPage chatId={id} initialMessages={listChatMessages.data} />
  );
}

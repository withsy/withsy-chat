import { useRouter } from "next/router";
import { mockChatMessages } from "@/data/chat/chat-001";
import { ChatSessionPage } from "@/components/chat/ChatSessionPage";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") return null;

  const messages = mockChatMessages.filter((m) => m.chatId === id);

  return <ChatSessionPage chatId={id} messages={messages} />;
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChatSessionPage } from "@/components/chat/ChatSessionPage";
import type { ChatMessage } from "@/types/chat";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadMessages = async () => {
      try {
        const module = await import(`@/data/chat/${id}`);
        const data =
          module[`mockChatMessages_${id}`] || module.default || module.chat001;
        setMessages(data);
      } catch (err) {
        console.error("❌ Failed to load chat data:", err);
        setMessages([]);
      }
    };

    loadMessages();
  }, [id]);

  if (!id || typeof id !== "string" || messages === null) return null;

  return <ChatSessionPage chatId={id} messages={messages} />;
}

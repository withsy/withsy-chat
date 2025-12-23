import ChatView from "@/components/chat/ChatView";
import { PartialError } from "@/components/Error";
import { ChatLayout } from "@/components/layout/ChatLayout";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;
  const chatId = typeof id === "string" ? id : null;

  if (!chatId) return <PartialError message="Invalid chat id" />;

  return (
    <ChatLayout>
      <ChatView chatId={chatId} />
    </ChatLayout>
  );
}

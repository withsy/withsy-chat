import ChatView from "@/components/chat/ChatView";
import { PartialError } from "@/components/Error";
import { ChatLayout } from "@/components/layout/ChatLayout";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  const { id } = router.query;
  const chatId = typeof id === "string" ? id : "";

  if (!chatId) {
    return <PartialError message="Invalid chatId." />;
  }

  return (
    <ChatLayout>
      <ChatView chatId={chatId} />
    </ChatLayout>
  );
}

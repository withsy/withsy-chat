import ChatView from "@/components/chat/ChatView";
import { PartialError } from "@/components/Error";
import { ChatLayout } from "@/components/layout/ChatLayout";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  const { chatId } = router.query;
  if (typeof chatId !== "string" || !chatId) {
    return <PartialError message="Invalid chatId." />;
  }

  return (
    <ChatLayout>
      <ChatView chatId={chatId} />
    </ChatLayout>
  );
}

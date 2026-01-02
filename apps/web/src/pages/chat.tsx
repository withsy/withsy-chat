import { ChatSession } from "@/components/chat/ChatSession";
import ChatLayout from "@/features/chat/components/ChatLayout";
import Greeting from "@/features/chat/components/Greeting";

export default function Page() {
  return (
    <ChatLayout>
      <ChatSession>
        <Greeting />
      </ChatSession>
    </ChatLayout>
  );
}

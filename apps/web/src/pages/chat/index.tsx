import EmptyChatView from "@/components/chat/EmptyChatView";
import { DynamicChatLayout } from "@/components/layout/DynamicChatLayout";

export default function Page() {
  return (
    <DynamicChatLayout>
      <EmptyChatView />
    </DynamicChatLayout>
  );
}

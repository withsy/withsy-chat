import type { ChatMessage } from "@/types/chat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputBox } from "./ChatInputBox";

type Props = {
  chatId: string;
  messages: ChatMessage[];
};
export function ChatSessionPage({ chatId, messages }: Props) {
  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-y-auto px-4 py-2 mb-[120px]">
        <div className="mx-auto w-full max-w-3xl">
          <ChatMessageList messages={messages} />
        </div>
      </div>

      <div className="absolute bottom-[2vh] left-0 right-0 flex justify-center px-4">
        <div className="w-full max-w-3xl">
          <ChatInputBox chatId={chatId} />
        </div>
      </div>
    </div>
  );
}

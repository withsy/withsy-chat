import type { ChatId } from "@/common-schemas";
import { useChatProp } from "@/hooks/useChat";
import { useUserStore } from "@/stores/useUserStore";
import Link from "next/link";

const newChatMessages = [
  "You've started a new chat. How can I help you today?",
  "Welcome! What would you like to talk about?",
  "A new conversation begins. Ask me anything!",
  "New chat started. Let’s explore together!",
];

const branchChatMessages = [
  {
    prefix: "🌿 This is a branch from a previous chat. ",
    linkText: "Go to original",
  },
  {
    prefix: "🔗 You've branched off from an earlier conversation. ",
    linkText: "View original chat",
  },
  {
    prefix: "📎 This branch continues from a previous message. ",
    linkText: "Click here to go back",
  },
  { prefix: "🧵 You're in a branch chat. ", linkText: "See the original" },
];

function generateRandomMessage<T extends { prefix?: string } | string>(
  messages: T[],
): T {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

export default function ChatInformationSystemMessage({
  chatId,
}: {
  chatId: ChatId;
}) {
  const chatType = useChatProp(chatId, "type");
  const chatId = chat.parentMessage?.chatId;
  const messageId = chat.parentMessageId;

  const content = (() => {
    if (chatType === "chat") {
      const message = generateRandomMessage(newChatMessages);
      return (
        <div className="text-muted-foreground text-center italic select-none">
          {message}
        </div>
      );
    } else if (chatType === "branch" && chatId && messageId) {
      const message = generateRandomMessage(branchChatMessages);
      return (
        <div className="text-muted-foreground text-center italic select-none">
          {message.prefix}
          <Link
            href={`/chat/${chatId}?messageId=${messageId}`}
            className="text-blue-500 underline"
          >
            {message.linkText}
          </Link>
        </div>
      );
    }
    return null;
  })();

  return (
    <div key={chatId} className="my-4 flex justify-center p-4">
      {content}
    </div>
  );
}

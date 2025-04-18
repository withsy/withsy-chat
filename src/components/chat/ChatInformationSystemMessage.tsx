import type { Chat } from "@/types/chat";
import Link from "next/link";

interface ChatInformationSystemMessageProps {
  chat: Chat;
}

const ChatInformationSystemMessage: React.FC<
  ChatInformationSystemMessageProps
> = ({ chat }) => {
  const chatType = chat.type;
  const chatId = chat.parentMessage?.chatId;
  const messageId = chat.parentMessageId;

  let content: React.ReactNode = null;

  if (chatType === "chat") {
    const message = getRandomMessage(newChatMessages);
    content = <span className="text-muted-foreground italic">{message}</span>;
  } else if (chatType === "branch" && chatId && messageId) {
    const message = getRandomMessage(branchChatMessages);
    content = (
      <span className="text-muted-foreground italic">
        {message.prefix}
        <Link
          href={`/chat/${chatId}?messageId=${messageId}`}
          className="underline text-blue-500"
        >
          {message.linkText}
        </Link>
      </span>
    );
  }

  return (
    <div key={chat.id} className="flex justify-center my-4 py-4">
      {content}
    </div>
  );
};

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
    prefix: "📎 This thread continues from a previous message. ",
    linkText: "Click here to go back",
  },
  { prefix: "🧵 You're in a branch chat. ", linkText: "See the original" },
];

function getRandomMessage<T extends { prefix?: string } | string>(
  messages: T[]
): T {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

export default ChatInformationSystemMessage;

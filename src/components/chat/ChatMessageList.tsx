import { useUser } from "@/context/UserContext";
import type { Chat } from "@/types/chat";
import { MessageId, type Message } from "@/types/message";
import { ChevronsDown } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "./ChatBubble";
import ChatInformationSystemMessage from "./ChatInformationSystemMessage";

type Props = {
  chat: Chat | null;
  messages: Message[];
  onToggleSaved: (id: string, newValue: boolean) => void;
};

export function ChatMessageList({ chat, messages, onToggleSaved }: Props) {
  const router = useRouter();
  const { user } = useUser();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const hasMounted = useRef(false);
  const prevMessageLength = useRef(messages.length);

  const messageId = router.query.messageId as string | undefined;

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;

      if (!messageId) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messageId]);

  useEffect(() => {
    const hasNewMessage = messages.length > prevMessageLength.current;
    prevMessageLength.current = messages.length;

    if (!messageId && hasNewMessage) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messageId]);

  useEffect(() => {
    if (messageId) {
      const id = MessageId.parse(messageId);
      const targetRef = messageRefs.current[id];
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [messageId, messages]);

  useEffect(() => {
    if (messageId) {
      const timeout = setTimeout(() => {
        const { messageId: _, ...rest } = router.query;
        router.replace(
          {
            pathname: router.pathname,
            query: rest,
          },
          undefined,
          { shallow: true }
        );
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messageId, messages, router]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 150;
      const canScroll = el.scrollHeight > el.clientHeight;

      if (!canScroll) {
        setShowScrollToBottom(false);
        return;
      }

      const isScrolledUp =
        el.scrollHeight - el.scrollTop - el.clientHeight > threshold;
      setShowScrollToBottom(isScrolledUp);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!user) return null;

  return (
    <div className="relative h-full">
      <div
        ref={listRef}
        className="space-y-12 overflow-x-hidden overflow-y-auto h-full pr-2"
      >
        {chat != null && <ChatInformationSystemMessage chat={chat} />}
        {messages.map((msg) =>
          msg.role === "system" ? (
            <div key={msg.id} className="flex justify-center my-4 py-4">
              <span className="text-muted-foreground italic">{msg.text}</span>
            </div>
          ) : (
            <div
              key={msg.id}
              ref={(el) => {
                messageRefs.current[msg.id] = el;
              }}
            >
              <ChatBubble
                key={msg.id}
                message={msg}
                onToggleSaved={onToggleSaved}
              />
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute left-1/2 bottom-5 transform -translate-x-1/2 text-white p-2 rounded-full shadow-md transition"
          style={{ backgroundColor: `rgb(${user.preferences.themeColor})` }}
        >
          <ChevronsDown size={16} />
        </button>
      )}
    </div>
  );
}

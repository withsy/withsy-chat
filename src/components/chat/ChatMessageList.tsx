import { useUser } from "@/context/UserContext";
import type { Chat, ChatMessage } from "@/types/chat";
import { ChevronsDown } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ChatBubble } from "./ChatBubble";
import ChatInformationSystemMessage from "./ChatInformationSystemMessage";

type Props = {
  chat: Chat | null;
  messages: ChatMessage[];
  onToggleSaved: (id: number, newValue: boolean) => void;
  shouldAutoScrollRef: RefObject<boolean>;
};

export function ChatMessageList({
  chat,
  messages,
  onToggleSaved,
  shouldAutoScrollRef,
}: Props) {
  const router = useRouter();
  const { messageId } = router.query;

  const { userPrefs } = useUser();
  const { themeColor } = userPrefs;

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const messageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (messageId && messageId !== "last") {
      const id = parseInt(messageId as string, 10);
      const targetRef = messageRefs.current[id];
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [messageId, messages]);

  useEffect(() => {
    if (messageId) {
      const timeout = setTimeout(() => {
        if (messageId == "last") {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
          const id = parseInt(messageId as string, 10);
          const targetRef = messageRefs.current[id];
          if (targetRef) {
            targetRef.scrollIntoView({ behavior: "smooth" });
          }
        }
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
    if (shouldAutoScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
    shouldAutoScrollRef.current = false;
  }, [messages, shouldAutoScrollRef]);

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

  return (
    <div className="relative h-full">
      <div
        ref={listRef}
        className="space-y-12 overflow-x-hidden overflow-y-auto h-full pr-2"
      >
        {chat != null && <ChatInformationSystemMessage chat={chat} />}
        {messages.map((msg) =>
          msg.role == "system" ? (
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
          className="absolute left-1/2 bottom-10 transform -translate-x-1/2 text-white p-2 rounded-full shadow-md transition"
          style={{ backgroundColor: `rgb(${themeColor})` }}
        >
          <ChevronsDown size={16} />
        </button>
      )}
    </div>
  );
}

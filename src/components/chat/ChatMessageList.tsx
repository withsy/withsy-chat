import { useUser } from "@/context/UserContext";
import type { ChatMessage } from "@/types/chat";
import { ChevronsDown } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ChatBubble } from "./ChatBubble";

type Props = {
  chatId: string | null;
  messages: ChatMessage[];
  onToggleSaved: (id: number, newValue: boolean) => void;
  shouldAutoScrollRef: RefObject<boolean>;
};

export function ChatMessageList({
  chatId,
  messages,
  onToggleSaved,
  shouldAutoScrollRef,
}: Props) {
  const { userPrefs } = useUser();
  const { themeColor } = userPrefs;

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useEffect(() => {
    // defer scroll to bottom until DOM is painted
    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 0);

    return () => clearTimeout(timeout);
  }, [chatId]);

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
        {messages.map((msg) =>
          msg.role == "system" ? (
            <div key={msg.id} className="flex justify-center my-4 py-4">
              <span className="text-muted-foreground italic">{msg.text}</span>
            </div>
          ) : (
            <ChatBubble
              key={msg.id}
              message={msg}
              onToggleSaved={onToggleSaved}
            />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute left-1/2 bottom-2 transform -translate-x-1/2 text-white p-2 rounded-full shadow-md transition"
          style={{ backgroundColor: `rgb(${themeColor})` }}
        >
          <ChevronsDown size={16} />
        </button>
      )}
    </div>
  );
}

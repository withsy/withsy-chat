import type { ChatId, ChatMessageId } from "@/common-schemas";
import { useChatMessageList } from "@/hooks/useChatMessage";
import { useUserPreference } from "@/hooks/useUser";
import { useTRPC } from "@/lib/trpc";
import { useUserStore } from "@/stores/useUserStore";
import { useSubscription } from "@trpc/tanstack-react-query";
import { ChevronsDown } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
// import ChatInformationSystemMessage from "./ChatInformationSystemMessage";

export function ChatMessageList({ chatId }: { chatId: ChatId }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const chatMessageRefMap = useRef(new Map<ChatMessageId, HTMLDivElement>());
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const themeColor = useUserPreference("themeColor");
  const chatMessageList = useChatMessageList(chatId);
  const chatMessageIdSet =
    useUserStore((s) => s.chatMessageIdMap.get(chatId)) ?? new Set();
  const chatMessageIds = chatMessageIdSet.keys().toArray().toSorted();

  useEffect(() => {
    if (chatMessageList.data) {
      const chatMessages = chatMessageList.data.pages.flatMap(
        (page) => page.items,
      );
      useUserStore.getState().setChatMessages(chatMessages);
    }
  }, [chatMessageList.data]);

  // const hasMounted = useRef(false);
  // const prevMessageLength = useRef(messages.length);

  // const messageId = router.query.messageId as string | undefined;

  // useEffect(() => {
  //   if (!hasMounted.current) {
  //     hasMounted.current = true;

  //     if (!messageId) {
  //       bottomRef.current?.scrollIntoView({ behavior: "auto" });
  //     }
  //   }
  // }, [messageId]);

  // useEffect(() => {
  //   const hasNewMessage = messages.length > prevMessageLength.current;
  //   prevMessageLength.current = messages.length;

  //   if (!messageId && hasNewMessage) {
  //     bottomRef.current?.scrollIntoView({ behavior: "auto" });
  //   }
  // }, [messages, messageId]);

  // useEffect(() => {
  //   if (messageId) {
  //     const id = MessageId.parse(messageId);
  //     const targetRef = messageRefs.current[id];
  //     if (targetRef) {
  //       targetRef.scrollIntoView({ behavior: "auto", block: "start" });
  //     }
  //   }
  // }, [messageId, messages]);

  // useEffect(() => {
  //   if (messageId) {
  //     const timeout = setTimeout(() => {
  //       const { messageId: _, ...rest } = router.query;
  //       router.replace(
  //         {
  //           pathname: router.pathname,
  //           query: rest,
  //         },
  //         undefined,
  //         { shallow: true },
  //       );
  //     }, 100);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [messageId, messages, router]);

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
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  };

  return (
    <div className="relative h-full">
      <div
        ref={listRef}
        className="h-full space-y-12 overflow-x-hidden overflow-y-auto pr-2"
      >
        {/* <ChatInformationSystemMessage chatId={chatId} /> */}
        {chatMessageIds.map((chatMessageId) => (
          <div
            key={chatMessageId}
            ref={(el) => {
              if (el) {
                chatMessageRefMap.current.set(chatMessageId, el);
              } else {
                chatMessageRefMap.current.delete(chatMessageId);
              }
            }}
          >
            <ChatBubble key={chatMessageId} chatMessageId={chatMessageId} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 transform rounded-full p-2 text-white shadow-md transition"
          style={{ backgroundColor: `rgb(${themeColor})` }}
        >
          <ChevronsDown size={16} />
        </button>
      )}
    </div>
  );
}

import { useChatStore } from "@/stores/useChatStore";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ChatSession } from "./ChatSession";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function EmptyChatView() {
  const { data: session } = useSession({ required: true });
  const name = session?.user?.name;

  const [greeting, setGreeting] = useState("");
  const setChat = useChatStore((state) => state.setChat);

  useEffect(() => {
    setChat(null);

    // NOTE: Use Promise to avoid client/server hydration mismatch.
    Promise.try(() => setGreeting(getGreeting()));

    const interval = setInterval(
      () => {
        setGreeting(getGreeting());
      },
      1000 * 60 * 10,
    );
    return () => clearInterval(interval);
  }, [setChat, setGreeting]);

  if (!session || !greeting) {
    return null;
  }

  return (
    <ChatSession initialMessages={[]}>
      <div className="flex h-full w-full flex-col items-center justify-center px-4 select-none">
        <h1 className="text-2xl font-semibold">
          {greeting}
          {name && `, ${name}`}
        </h1>
      </div>
    </ChatSession>
  );
}

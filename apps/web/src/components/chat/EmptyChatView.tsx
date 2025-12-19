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
  const { data: session } = useSession();
  const name = session?.user?.name;

  const [greeting, setGreeting] = useState("Good day");
  const setChat = useChatStore((state) => state.setChat);

  useEffect(() => {
    setChat(null);
    setGreeting(getGreeting());
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 1000 * 60 * 10);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChatSession initialMessages={[]}>
      <div className="flex flex-col items-center justify-center w-full px-4 h-full select-none">
        <h1 className="text-2xl font-semibold">
          {greeting}
          {name && `, ${name}`}
        </h1>
      </div>
    </ChatSession>
  );
}

import { useUser } from "@/context/UserContext";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useEffect, useState } from "react";
import { ChatSession } from "./ChatSession";

type Prompt = {
  id?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isStar: boolean;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function EmptyChatView({
  name = "",
  prompts = [],
}: {
  name?: string;
  prompts?: Prompt[];
}) {
  const { isMobile } = useSidebarStore();
  const { user } = useUser();
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  return (
    <ChatSession chat={null} initialMessages={[]}>
      <div className="flex flex-col items-center justify-center w-full px-4 h-full">
        <h1 className="text-2xl font-semibold mb-20">
          {greeting}
          {name && `, ${name}`}
        </h1>
      </div>
    </ChatSession>
  );
}

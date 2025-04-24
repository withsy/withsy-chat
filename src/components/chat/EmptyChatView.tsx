import { PromptBadge } from "@/components/PromptBadge";
import { Button } from "@/components/ui/button";
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
  const { userPrefs } = useUser();
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, []);

  return (
    <ChatSession chat={null} initialMessages={[]}>
      <div className="flex flex-col items-center justify-center w-full px-4 h-full">
        <h1 className="text-2xl font-semibold mb-20">
          {greeting}
          {name && `, ${name}`}
        </h1>

        {!isMobile ? (
          <div className="flex items-center justify-center gap-3 flex-wrap w-full max-w-4xl px-4 mb-5">
            <span className="text-sm font-bold">Prompts</span>
            {prompts.slice(0, 5).map((prompt, index) => (
              <PromptBadge
                key={index}
                title={prompt.title}
                isStar={prompt.isStar}
                color={userPrefs.themeColor}
              />
            ))}
            <Button
              variant="link"
              className="h-auto px-1 py-0 text-xs active:underline hover:underline"
            >
              View all
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between w-full max-w-4xl px-4 mb-5">
              <span className="text-sm font-bold">Prompts</span>
              <Button
                variant="link"
                className="h-auto px-1 py-0 text-xs active:underline hover:underline"
              >
                View all
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-2 gap-y-5 w-full max-w-4xl px-4">
              {prompts.slice(0, 5).map((prompt, index) => (
                <PromptBadge
                  key={index}
                  title={prompt.title}
                  isStar={prompt.isStar}
                  color={userPrefs.themeColor}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </ChatSession>
  );
}

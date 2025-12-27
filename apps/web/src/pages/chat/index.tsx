import { ChatSession } from "@/components/chat/ChatSession";
import { ChatLayout } from "@/components/layout/ChatLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const _10minutesInMs = 10 * 60 * 1000;

function generateGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Page() {
  const session = useSession();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // NOTE: Use Promise to avoid client/server hydration mismatch.
    Promise.try(() => setGreeting(generateGreeting()));

    const interval = setInterval(
      () => setGreeting(generateGreeting()),
      _10minutesInMs,
    );

    return () => clearInterval(interval);
  }, [setGreeting]);

  const name = session.data?.user?.name;

  return (
    <ChatLayout>
      <ChatSession>
        <div className="flex h-full w-full flex-col items-center justify-center px-4 select-none">
          <h1 className="text-2xl font-semibold">
            {name && `${greeting}, ${name}`}
          </h1>
        </div>
      </ChatSession>
    </ChatLayout>
  );
}

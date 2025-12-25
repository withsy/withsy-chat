import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ChatSession } from "./ChatSession";

const _10minutesInMs = 10 * 60 * 1000;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function EmptyChatView() {
  const session = useSession();
  const name = session.data?.user?.name;

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // NOTE: Use Promise to avoid client/server hydration mismatch.
    Promise.try(() => setGreeting(getGreeting()));

    const interval = setInterval(
      () => setGreeting(getGreeting()),
      _10minutesInMs,
    );
    return () => clearInterval(interval);
  }, [setGreeting]);

  if (!session.data || !greeting) {
    return null;
  }

  return (
    <ChatSession>
      <div className="flex h-full w-full flex-col items-center justify-center px-4 select-none">
        <h1 className="text-2xl font-semibold">
          {greeting}
          {name && `, ${name}`}
        </h1>
      </div>
    </ChatSession>
  );
}

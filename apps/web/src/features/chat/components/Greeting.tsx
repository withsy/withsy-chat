import { PartialLoading } from "@/components/Loading";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const _10minutesInMs = 10 * 60 * 1000;

function generateGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) {
    return "Good night";
  }

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function Greeting() {
  const session = useSession();
  const [greeting, setGreeting] = useState(generateGreeting());

  useEffect(() => {
    const interval = setInterval(
      () => setGreeting(generateGreeting()),
      _10minutesInMs,
    );

    return () => clearInterval(interval);
  }, [setGreeting]);

  if (session.status === "loading") {
    return <PartialLoading />;
  }

  if (!session.data) {
    throw new Error("Invalid session.");
  }

  const name = session.data.user?.name;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 select-none">
      <h1 className="text-2xl font-semibold">
        {name && `${greeting}, ${name}`}
      </h1>
    </div>
  );
}

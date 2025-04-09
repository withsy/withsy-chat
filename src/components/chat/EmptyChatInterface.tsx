import { MessageSquare, Cpu, Book, Archive } from "lucide-react";
import { useEffect, useState } from "react";
import { InformationCard } from "@/components/chat/InformationCard";
import ChatInterface from "./ChatInterface";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function EmptyChatInterface({ name = "" }: { name?: string }) {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Archive",
      description: "Archive & manage your chats",
      icon: <Archive className="w-6 h-6 text-blue-500" />,
      onClick: () => console.log("Open Tag Modal"),
    },
    {
      title: "Prompt",
      description: "Manage auto & saved prompts",
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      onClick: () => console.log("Open Prompt Modal"),
    },
    {
      title: "Model",
      description: "Change default model & manage keys",
      icon: <Cpu className="w-6 h-6 text-purple-500" />,
      onClick: () => console.log("Open Model Modal"),
    },
    {
      title: "Guide",
      description: "How to use the service",
      icon: <Book className="w-6 h-6 text-orange-500" />,
      isExternal: true,
      onClick: () => window.open("https://your-guide-url.com", "_blank"),
    },
  ];

  return (
    <ChatInterface>
      <>
        <h1 className="text-2xl font-semibold mb-6">
          {greeting}
          {name && `, ${name}`}
        </h1>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {cards.map((card) => (
              <InformationCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </>
    </ChatInterface>
  );
}

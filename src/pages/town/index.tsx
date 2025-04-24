import { ModelAvatar } from "@/components/ModelAvatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  HelpingHand,
  MessageSquareText,
  NotebookPen,
  Palette,
  Target,
} from "lucide-react";

const friends = [
  {
    name: "Milo",
    role: "Let’s write something beautiful together.",
    specialty: "Gratitude Journaling",
  },
  {
    name: "Maddy",
    role: "Tell me everything. I’m listening.",
    specialty: "Emotional Venting",
  },
  {
    name: "Sunny",
    role: "You’re stronger than you think!",
    specialty: "Goals & Habits",
  },
  {
    name: "Skye",
    role: "Got something on your mind? Let’s chat!",
    specialty: "Creative Expression",
  },
  {
    name: "Luna",
    role: "I’ll be right here when you need me.",
    specialty: "Soft Support",
  },
];

function getSpecialtyIcon(specialty: string) {
  switch (specialty) {
    case "Gratitude Journaling":
      return <NotebookPen size={14} />;
    case "Emotional Venting":
      return <Heart size={14} />;
    case "Goals & Habits":
      return <Target size={14} />;
    case "Creative Expression":
      return <Palette size={14} />;
    case "Soft Support":
      return <HelpingHand size={14} />;
    default:
      return null;
  }
}

export default function Page() {
  return (
    <div className="h-screen overflow-y-auto flex justify-center items-center p-8">
      <div className="w-full max-w-3xl py-12">
        <div className="grid gap-4 sm:grid-cols-3 place-items-center">
          {friends.map((friend) => (
            <div
              key={friend.name}
              className="rounded-2xl shadow-md p-2 flex flex-col items-center text-center w-full bg-white dark:bg-zinc-900"
            >
              <ModelAvatar
                name={friend.name}
                path={`/characters/${friend.name.toLowerCase()}.svg`}
                size="xl"
              />
              <h2 className="text-lg font-semibold">{friend.name}</h2>
              <p className="italic text-xs text-zinc-500 mb-1">{friend.role}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Button
                  variant="outline"
                  className="text-sm flex items-center gap-1"
                >
                  <MessageSquareText size={14} />
                  Talk
                </Button>
                <Button
                  variant="outline"
                  className="text-sm flex items-center gap-1"
                >
                  {getSpecialtyIcon(friend.specialty)}
                  {friend.specialty}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

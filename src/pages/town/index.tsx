import { FriendCard } from "@/components/town/FriendCard";
import { useUser } from "@/context/UserContext";
import { Heart } from "lucide-react";

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

export default function Page() {
  const { userPrefs } = useUser();

  return (
    <div className="flex flex-col h-screen">
      <div
        className="p-2 mt-2 flex items-center gap-2 select-none flex-shrink-0"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Heart size={22} fill={`rgb(${userPrefs.themeColor})`} />
        <h1 className="text-xl font-semibold">Withsy Friends</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-30">
        <div className="max-w-4xl mx-auto grid gap-4 sm:grid-cols-3 gap-y-5 p-5 place-items-center">
          {friends.map((friend) => (
            <FriendCard key={friend.name} friend={friend} />
          ))}
        </div>
      </div>
    </div>
  );
}

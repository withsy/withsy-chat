import { ModelAvatar } from "@/components/ModelAvatar";
import { Button } from "@/components/ui/button";

const characterMoods = {
  Milo: {
    morning: "bright and hopeful",
    afternoon: "calm and reflective",
    night: "cozy and thoughtful",
  },
  Maddy: {
    morning: "sleepy but kind",
    afternoon: "attentive and grounded",
    night: "slow and safe",
  },
  Sunny: {
    morning: "bubbly and pumped",
    afternoon: "cheerful and motivating",
    night: "quiet but still positive",
  },
  Skye: {
    morning: "fresh and curious",
    afternoon: "talkative and upbeat",
    night: "dreamy and playful",
  },
  Luna: {
    morning: "gentle and serene",
    afternoon: "softly empathetic",
    night: "deeply emotional and loving",
  },
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
};
const friends = [
  {
    name: "Milo",
    role: "Let’s write something beautiful together.",
  },
  {
    name: "Maddy",
    role: "Tell me everything. I’m listening.",
  },
  {
    name: "Sunny",
    role: "You’re stronger than you think!",
  },
  {
    name: "Skye",
    role: "Got something on your mind? Let’s chat!",
  },
  {
    name: "Luna",
    role: "I’ll be right here when you need me.",
  },
];

export default function Page() {
  const timeOfDay = getTimeOfDay();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="grid gap-4 sm:grid-cols-2">
        {friends.map((friend) => (
          <div
            key={friend.name}
            className="rounded-2xl shadow-md p-4 flex flex-col items-center text-center bg-white dark:bg-zinc-900"
          >
            <ModelAvatar name={friend.name} size="xl" />
            <h2 className="text-lg font-semibold">{friend.name}</h2>
            <p className="italic text-sm text-zinc-500 mb-1">{friend.role}</p>
            <span className="text-xs text-zinc-400">
              {
                characterMoods[friend.name as keyof typeof characterMoods][
                  timeOfDay
                ]
              }
            </span>
            <Button variant="outline" className="mt-2 text-xs">
              Talk
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

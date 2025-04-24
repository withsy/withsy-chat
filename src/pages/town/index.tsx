import { ModelAvatar } from "@/components/ModelAvatar";
import { Button } from "@/components/ui/button";

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
    specialty: "Goal & Habit Planning",
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
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="grid gap-4 sm:grid-cols-3">
        {friends.map((friend) => (
          <div
            key={friend.name}
            className="rounded-2xl shadow-md p-4 flex flex-col items-center text-center bg-white dark:bg-zinc-900"
          >
            <ModelAvatar
              name={friend.name}
              path={`/characters/${friend.name.toLocaleLowerCase()}.svg`}
              size="xl"
            />
            <h2 className="text-lg font-semibold">{friend.name}</h2>
            <p className="italic text-sm text-zinc-500 mb-1">{friend.role}</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline">Talk</Button>
              <Button variant="outline">{friend.specialty}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

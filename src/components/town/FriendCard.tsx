import { ModelAvatar } from "@/components/ModelAvatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  HelpingHand,
  History,
  NotebookPen,
  Palette,
  Target,
} from "lucide-react";

export interface Friend {
  name: string;
  role: string;
  specialty: string;
}

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

export function FriendCard({ friend }: { friend: Friend }) {
  return (
    <div
      key={friend.name}
      className="relative w-full max-w-sm min-h-[220px] rounded-2xl border p-5 pt-10 flex flex-col items-center text-center"
    >
      <Button
        variant="ghost"
        className="absolute top-2 right-2 rounded-2xl text-sm text-zinc-800 flex items-center gap-1"
      >
        <History size={14} />
      </Button>

      <ModelAvatar
        name={friend.name}
        path={`/characters/${friend.name.toLowerCase()}.svg`}
        size="xl"
      />

      <h2 className="text-lg font-semibold">{friend.name}</h2>
      <Button
        variant="ghost"
        className="rounded-2xl text-sm text-zinc-800 flex bg-gray items-center mt-5 whitespace-normal"
      >
        {getSpecialtyIcon(friend.specialty)}
        {friend.specialty}
      </Button>
    </div>
  );
}

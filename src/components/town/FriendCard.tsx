import { Heart, HelpingHand, NotebookPen, Palette, Target } from "lucide-react";
import { getCharacterStyle, type CharacterName } from "./characterStyles";
import { HoverInvertButton } from "./HoverInvertButton";

export interface Friend {
  name: CharacterName;
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
  const friendStyle = getCharacterStyle(friend.name);

  return (
    <div
      className="rounded-xl h-full flex flex-col justify-between select-none"
      style={{
        backgroundColor: friendStyle.backgroundColor,
        color: friendStyle.textColor,
      }}
    >
      <div className="p-6 pb-0">
        <div className="mb-4 text-sm font-semibold opacity-80 inline-flex items-center gap-1">
          {getSpecialtyIcon(friend.specialty)}
          {friend.name.charAt(0).toUpperCase() + friend.name.slice(1)}
        </div>
        <h2 className="text-2xl font-bold mb-2 min-h-[56px]">{friend.role}</h2>
      </div>
      <div className="flex items-center justify-between mt-4">
        {friendStyle.position === "left" && (
          <img
            src={`/characters/${friend.name}.svg`}
            alt={friend.name}
            className="w-24 h-24 rounded-xl"
          />
        )}
        <div className={friendStyle.position === "left" ? "pr-6" : "pl-6"}>
          <HoverInvertButton
            textColor={friendStyle.textColor}
            onClick={() => console.log(`${friend.name} clicked!`)}
          >
            {friend.specialty}
          </HoverInvertButton>
        </div>
        {friendStyle.position === "right" && (
          <img
            src={`/characters/${friend.name}.svg`}
            alt={friend.name}
            className="w-24 h-24 rounded-xl"
          />
        )}
      </div>
    </div>
  );
}

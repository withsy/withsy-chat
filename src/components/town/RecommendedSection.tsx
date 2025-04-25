import { Gem, Gift } from "lucide-react";
import { HoverInvertButton } from "./HoverInvertButton";

interface Friend {
  name: string;
  role: string;
  specialty: string;
}

interface RecommendedSectionProps {
  bestFriend: Friend;
  extraFriend: Friend;
  message: string;
}

const characterStyles: Record<
  string,
  {
    backgroundColor: string;
    textColor: "black" | "white";
    position: "left" | "right";
  }
> = {
  maddy: {
    backgroundColor: "rgb(241, 244, 220)",
    textColor: "black",
    position: "left",
  },
  milo: {
    backgroundColor: "rgb(241, 244, 220)",
    textColor: "black",
    position: "right",
  },
  luna: {
    backgroundColor: "rgb(10, 91, 131)",
    textColor: "white",
    position: "left",
  },
  skye: {
    backgroundColor: "rgb(241, 244, 220)",
    textColor: "black",
    position: "right",
  },
  sunny: {
    backgroundColor: "rgb(105, 210, 231)",
    textColor: "black",
    position: "left",
  },
};

type CharacterName = keyof typeof characterStyles;

export function RecommendedSection({
  bestFriend,
  extraFriend,
  message,
}: RecommendedSectionProps) {
  const key = bestFriend.name.toLowerCase() as CharacterName;
  const friendStyle = characterStyles[key];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full px-4 py-6 select-none">
      <div
        className="rounded-xl md:col-span-2"
        style={{
          backgroundColor: friendStyle.backgroundColor,
          color: friendStyle.textColor,
        }}
      >
        <div className="p-6 pb-0">
          <div className="mb-4 text-sm font-semibold opacity-80 inline-flex items-center gap-1">
            <Gift />
            Recommended
          </div>
          <h2 className="text-2xl font-bold mb-2">{message}</h2>
          <p className="text-sm mb-4">Your best match for this moment</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          {friendStyle.position === "left" && (
            <img
              src={`/characters/${bestFriend.name.toLowerCase()}.svg`}
              alt={bestFriend.name}
              className="w-24 h-24 rounded-xl"
            />
          )}
          <div className="px-6">
            <HoverInvertButton
              textColor={friendStyle.textColor}
              onClick={() => console.log(`${bestFriend.name} clicked!`)}
            >
              {bestFriend.specialty}
            </HoverInvertButton>
          </div>
          {friendStyle.position === "right" && (
            <img
              src={`/characters/${bestFriend.name.toLowerCase()}.svg`}
              alt={bestFriend.name}
              className="w-24 h-24 rounded-xl"
            />
          )}
        </div>
      </div>
      <div className="bg-gray-100 p-6 rounded-xl flex flex-col justify-between items-start">
        <div>
          <div className="text-sm font-semibold text-gray-500 mb-2 inline-flex items-center gap-1">
            <Gem />
            Another Good Choice
          </div>
          <p className="text-lg font-semibold text-black mb-4">
            {extraFriend.name}
          </p>
          <p className="text-sm text-gray-600 mb-2">{extraFriend.role}</p>
        </div>

        <HoverInvertButton
          textColor={friendStyle.textColor}
          onClick={() => console.log(`${extraFriend.name} clicked!`)}
        >
          {extraFriend.specialty}
        </HoverInvertButton>
      </div>
    </div>
  );
}

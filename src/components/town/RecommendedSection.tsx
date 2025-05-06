import { Gem, Gift } from "lucide-react";
import Image from "next/image";
import { HoverInvertButton } from "./HoverInvertButton";
import { characterStyles, type CharacterName } from "./characterStyles";
import { type RecommendedFriends } from "./withsyFriends";

type Props = {
  recommendedFriends: RecommendedFriends;
};

export function RecommendedSection({ recommendedFriends }: Props) {
  const { message, bestFriend, extraFriend } = recommendedFriends;

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
            <Image
              src={`/characters/${bestFriend.name.toLowerCase()}.svg`}
              alt={bestFriend.name}
              width={96}
              height={96}
              className="rounded-xl"
            />
          )}
          <div className="px-6">
            <HoverInvertButton
              textColor={friendStyle.textColor}
              onClick={() => {}}
            >
              {bestFriend.specialty}
            </HoverInvertButton>
          </div>
          {friendStyle.position === "right" && (
            <Image
              src={`/characters/${bestFriend.name.toLowerCase()}.svg`}
              alt={bestFriend.name}
              width={96}
              height={96}
              className="rounded-xl"
            />
          )}
        </div>
      </div>
      <div
        className="p-6 rounded-xl flex flex-col justify-between items-start"
        style={{
          backgroundColor: "rgb(248, 248, 247)",
        }}
      >
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

        <HoverInvertButton textColor="black" onClick={() => {}}>
          {extraFriend.specialty}
        </HoverInvertButton>
      </div>
    </div>
  );
}

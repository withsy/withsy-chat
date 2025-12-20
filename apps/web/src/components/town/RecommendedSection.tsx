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
    <div className="grid w-full grid-cols-1 gap-4 px-4 py-6 select-none md:grid-cols-3">
      <div
        className="rounded-xl md:col-span-2"
        style={{
          backgroundColor: friendStyle.backgroundColor,
          color: friendStyle.textColor,
        }}
      >
        <div className="p-6 pb-0">
          <div className="mb-4 inline-flex items-center gap-1 text-sm font-semibold opacity-80">
            <Gift />
            Recommended
          </div>
          <h2 className="mb-2 text-2xl font-bold">{message}</h2>
          <p className="mb-4 text-sm">Your best match for this moment</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
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
        className="flex flex-col items-start justify-between rounded-xl p-6"
        style={{
          backgroundColor: "rgb(248, 248, 247)",
        }}
      >
        <div>
          <div className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-gray-500">
            <Gem />
            Another Good Choice
          </div>
          <p className="mb-4 text-lg font-semibold text-black">
            {extraFriend.name}
          </p>
          <p className="mb-2 text-sm text-gray-600">{extraFriend.role}</p>
        </div>

        <HoverInvertButton textColor="black" onClick={() => {}}>
          {extraFriend.specialty}
        </HoverInvertButton>
      </div>
    </div>
  );
}

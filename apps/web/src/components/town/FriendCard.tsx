import Image from "next/image";
import { getCharacterStyle } from "./characterStyles";
import { HoverInvertButton } from "./HoverInvertButton";
import type { WithsyFriend } from "./withsyFriends";

export function FriendCard({ friend }: { friend: WithsyFriend }) {
  const friendStyle = getCharacterStyle(friend.name);
  const isLoading = false;

  return (
    <div
      className="flex h-full flex-col justify-between rounded-xl select-none"
      style={{
        backgroundColor: friendStyle.backgroundColor,
        color: friendStyle.textColor,
      }}
    >
      <div className="p-6 pb-0">
        <div className="mb-4 inline-flex items-center gap-1 text-sm font-semibold opacity-80">
          {friend.name.charAt(0).toUpperCase() + friend.name.slice(1)}
        </div>
        <h2 className="mb-2 min-h-[56px] text-2xl font-bold">{friend.role}</h2>
      </div>
      <div className="mt-4 flex items-center justify-between overflow-hidden rounded-xl">
        {friendStyle.position === "left" && (
          <Image
            src={`/characters/${friend.name}.svg`}
            alt={friend.name}
            width={96}
            height={96}
            className="h-24 w-24"
          />
        )}

        <div className={friendStyle.position === "left" ? "pr-6" : "pl-6"}>
          <HoverInvertButton
            textColor={friendStyle.textColor}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : friend.specialty}
          </HoverInvertButton>
        </div>
        {friendStyle.position === "right" && (
          <Image
            src={`/characters/${friend.name}.svg`}
            alt={friend.name}
            width={96}
            height={96}
            className="h-24 w-24"
          />
        )}
      </div>
    </div>
  );
}

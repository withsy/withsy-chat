import { FriendCard } from "@/components/town/FriendCard";
import { useUser } from "@/context/UserContext";
import chroma from "chroma-js";
import { Gem, Gift } from "lucide-react";

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

export function RecommendedSection({
  bestFriend,
  extraFriend,
  message,
}: RecommendedSectionProps) {
  const { userPrefs } = useUser();
  const base = chroma(
    `rgba(${userPrefs.themeColor}, ${userPrefs.themeOpacity})`
  );
  const darkAccent = base.darken(1).hex();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full px-4 py-6 select-none">
      <div
        className="col-span-2 p-6 rounded-xl"
        style={{
          backgroundColor: darkAccent,
        }}
      >
        <div className="mb-4 text-sm font-semibold opacity-80 inline-flex items-center gap-1">
          <Gift />
          Recommended
        </div>

        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        <p className="text-sm mb-4">Your best match for this moment</p>
        <FriendCard friend={bestFriend} />
      </div>

      {/* Right small card */}
      <div className="bg-gray-100 p-6 rounded-xl">
        <div className="text-sm font-semibold text-gray-500 mb-2 inline-flex items-center gap-1">
          <Gem />
          Another Good Choice
        </div>
        <p className="text-lg font-semibold text-black mb-4">
          {extraFriend.name}
        </p>
        <p className="text-sm text-gray-600 mb-2">{extraFriend.role}</p>
        <p className="text-xs text-gray-400">{extraFriend.specialty}</p>
      </div>
    </div>
  );
}

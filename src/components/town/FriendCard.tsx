import { useTRPC } from "@/lib/trpc";
import type * as Chat from "@/types/chat";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { getCharacterStyle } from "./characterStyles";
import { HoverInvertButton } from "./HoverInvertButton";
import type { ActionName, WithsyFriend } from "./withsyFriends";

export function FriendCard({ friend }: { friend: WithsyFriend }) {
  const trpc = useTRPC();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const friendStyle = getCharacterStyle(friend.name);

  const { mutateAsync: startCreativeExpression } = useMutation(
    trpc.gratitudeJournal.startChat.mutationOptions()
  );
  const { mutateAsync: startSoftSupport } = useMutation(
    trpc.gratitudeJournal.startChat.mutationOptions()
  );
  const { mutateAsync: startBookNotes } = useMutation(
    trpc.gratitudeJournal.startChat.mutationOptions()
  );
  const { mutateAsync: startGratitudeJournaling } = useMutation(
    trpc.gratitudeJournal.startChat.mutationOptions()
  );
  const { mutateAsync: startGoalsHabits } = useMutation(
    trpc.gratitudeJournal.startChat.mutationOptions()
  );
  const { mutateAsync: startEmotionalVenting } = useMutation(
    trpc.gratitudeJournal.startChat.mutationOptions()
  );

  const actionHandlers: Record<ActionName, () => Promise<ChatStartOutput>> = {
    creativeExpression: () =>
      startCreativeExpression({ idempotencyKey: uuid() }),
    softSupport: () => startSoftSupport({ idempotencyKey: uuid() }),
    bookNotes: () => startBookNotes({ idempotencyKey: uuid() }),
    gratitudeJournaling: () =>
      startGratitudeJournaling({ idempotencyKey: uuid() }),
    goalsHabits: () => startGoalsHabits({ idempotencyKey: uuid() }),
    emotionalVenting: () => startEmotionalVenting({ idempotencyKey: uuid() }),
  };

  const handleClick = async (action: ActionName) => {
    try {
      setIsLoading(true);
      const result = await actionHandlers[action]();
      router.push(`/chat/${result.chat.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };
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
          {friend.name.charAt(0).toUpperCase() + friend.name.slice(1)}
        </div>
        <h2 className="text-2xl font-bold mb-2 min-h-[56px]">{friend.role}</h2>
      </div>
      <div className="flex items-center justify-between mt-4 rounded-xl overflow-hidden">
        {friendStyle.position === "left" && (
          <Image
            src={`/characters/${friend.name}.svg`}
            alt={friend.name}
            width={96}
            height={96}
            className="w-24 h-24"
          />
        )}

        <div className={friendStyle.position === "left" ? "pr-6" : "pl-6"}>
          <HoverInvertButton
            textColor={friendStyle.textColor}
            onClick={() => handleClick(friend.action)}
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
            className="w-24 h-24"
          />
        )}
      </div>
    </div>
  );
}

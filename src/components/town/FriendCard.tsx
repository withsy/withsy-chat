import { trpc } from "@/lib/trpc";
import type { ChatStartOutput } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { getCharacterStyle } from "./characterStyles";
import { HoverInvertButton } from "./HoverInvertButton";
import type { ActionName, WithsyFriend } from "./withsyFriends";

const actionHandlers: Record<ActionName, () => void> = {
  creativeExpression: () =>
    trpc.gratitudeJournal.startChat
      .useMutation()
      .mutate({ idempotencyKey: uuid() }),
  softSupport: () =>
    trpc.gratitudeJournal.startChat
      .useMutation()
      .mutate({ idempotencyKey: uuid() }),
  bookNotes: () =>
    trpc.gratitudeJournal.startChat
      .useMutation()
      .mutate({ idempotencyKey: uuid() }),
  gratitudeJournaling: () =>
    trpc.gratitudeJournal.startChat
      .useMutation()
      .mutate({ idempotencyKey: uuid() }),
  goalsHabits: () =>
    trpc.gratitudeJournal.startChat
      .useMutation()
      .mutate({ idempotencyKey: uuid() }),
  emotionalVenting: () =>
    trpc.gratitudeJournal.startChat
      .useMutation()
      .mutate({ idempotencyKey: uuid() }),
};

export function FriendCard({ friend }: { friend: WithsyFriend }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const friendStyle = getCharacterStyle(friend.name);

  const { mutateAsync: startCreativeExpression } =
    trpc.gratitudeJournal.startChat.useMutation();
  const { mutateAsync: startSoftSupport } =
    trpc.gratitudeJournal.startChat.useMutation();
  const { mutateAsync: startBookNotes } =
    trpc.gratitudeJournal.startChat.useMutation();
  const { mutateAsync: startGratitudeJournaling } =
    trpc.gratitudeJournal.startChat.useMutation();
  const { mutateAsync: startGoalsHabits } =
    trpc.gratitudeJournal.startChat.useMutation();
  const { mutateAsync: startEmotionalVenting } =
    trpc.gratitudeJournal.startChat.useMutation();

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
          <img
            src={`/characters/${friend.name}.svg`}
            alt={friend.name}
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
          <img
            src={`/characters/${friend.name}.svg`}
            alt={friend.name}
            className="w-24 h-24"
          />
        )}
      </div>
    </div>
  );
}

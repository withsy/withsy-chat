import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";

export function useChatUpdate() {
  const trpc = useTRPC();

  return useMutation(trpc.chat.update.mutationOptions({}));
}

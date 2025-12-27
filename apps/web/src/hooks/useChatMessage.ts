import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";

export function useChatMessageSend() {
  const trpc = useTRPC();

  // TODO: handle mutation datas.
  return useMutation(trpc.chatMessage.send.mutationOptions());
}

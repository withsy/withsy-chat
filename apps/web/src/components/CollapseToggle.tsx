import type { ChatMessageId } from "@/common-schemas";
import { useUserPreference } from "@/hooks/useUser";
import { isLongChatMessage } from "@/lib/chat-utils";
import { useUserStore } from "@/stores/useUserStore";

export function CollapseToggle({
  chatMessageId,
}: {
  chatMessageId: ChatMessageId;
}) {
  const themeColor = useUserPreference("themeColor");
  const chatMessage = useUserStore((s) => s.chatMessageMap.get(chatMessageId));

  if (!chatMessage) {
    return <div />;
  }

  const { isCollapsed, text, status } = chatMessage;
  const isShow = isLongChatMessage(text) && status === "succeeded";
  if (!isShow) {
    return <div />;
  }

  const handleClick = () => {
    useUserStore.setState((state) => {
      const chatMessage = state.chatMessageMap.get(chatMessageId);
      if (chatMessage) {
        chatMessage.isCollapsed = !isCollapsed;
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      className="text-sm select-none hover:underline active:underline"
      style={{ color: `rgb(${themeColor})` }}
    >
      {isCollapsed ? "Show More" : "Show Less"}
    </button>
  );
}

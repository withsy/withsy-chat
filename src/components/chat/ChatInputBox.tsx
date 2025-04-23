import { useChatSession } from "@/context/ChatSessionContext";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import type { UserUsageLimit } from "@/types/user-usage-limit";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ModelSelect } from "./ModelSelect";
import { UsageLimitNotice } from "./UsageLimitNotice";

type Props = {
  onSendMessage: (message: string) => void;
  usageLimit: UserUsageLimit | null;
  shouldFocus?: boolean;
};

export function ChatInputBox({
  onSendMessage,
  usageLimit,
  shouldFocus = false,
}: Props) {
  const { userPrefs } = useUser();
  const { status } = useChatSession();
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const enterToSend = userPrefs["enterToSend"];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const inputBoxClass = cn(
    "relative max-w-screen-md w-full px-4 py-3 border rounded-xl bg-white",
    "transition-all"
  );

  const placeholderMessages = [
    "What's on your mind?",
    "Wanna talk?",
    "Feel free to say anything",
    "I'm all ears!",
    "Say hi or just share a thought",
  ];

  const [randomPlaceholder] = useState(() => {
    return placeholderMessages[
      Math.floor(Math.random() * placeholderMessages.length)
    ];
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (shouldFocus) {
      textareaRef.current?.focus();
    }
  }, [shouldFocus]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterToSend && e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    } else if (
      !enterToSend &&
      e.key === "Enter" &&
      e.shiftKey &&
      !isComposing
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={inputBoxClass}>
      <div className="mb-3 flex items-center justify-between">
        <ModelSelect />
      </div>
      <TextareaAutosize
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={randomPlaceholder}
        className="w-full resize-none text-[16px] focus:outline-none bg-transparent mb-5 max-h-[40vh]"
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <div>
          {usageLimit && (
            <UsageLimitNotice
              dailyRemaining={usageLimit.dailyRemaining}
              dailyResetAt={new Date(usageLimit.dailyResetAt)}
              minuteRemaining={usageLimit.minuteRemaining}
              minuteResetAt={new Date(usageLimit.minuteResetAt)}
              themeColor={userPrefs.themeColor}
            />
          )}
        </div>
        <button
          onClick={handleSend}
          className="group p-2 rounded-md"
          aria-label="Send message"
          style={{
            ["--theme-color" as any]: `rgb(${userPrefs.themeColor})`,
          }}
        >
          <div
            className="
      bg-[var(--theme-color)]
      opacity-100
      group-hover:opacity-80
      group-active:opacity-80
      rounded-md p-2 transition-all
    "
          >
            <Send className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}

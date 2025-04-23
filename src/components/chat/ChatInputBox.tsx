import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import type { UserUsageLimit } from "@/types/user-usage-limit";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ModelSelect } from "./ModelSelect";

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
            <span
              className="select-none text-xs text-gray-500"
              style={{ color: `rgb(${userPrefs.themeColor})` }}
            >
              {usageLimit.dailyRemaining <= 3 &&
                (usageLimit.dailyRemaining > 0
                  ? `Remaining uses today: ${
                      usageLimit.dailyRemaining
                    } (Resets at ${new Date(
                      usageLimit.dailyResetAt
                    ).toLocaleTimeString()})`
                  : `No remaining uses today. Please wait until ${new Date(
                      usageLimit.dailyResetAt
                    ).toLocaleTimeString()} to continue.`)}
            </span>
          )}
        </div>
        <button
          onClick={handleSend}
          className="p-2 rounded-md hover:bg-gray-200 active:bg-gray-200"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

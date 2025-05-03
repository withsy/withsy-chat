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
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isSendDisabled =
    usageLimit !== null &&
    (usageLimit.dailyRemaining === 0 || usageLimit.minuteRemaining === 0);

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

  // 초기 포커스 설정: 컴포넌트 마운트 시 포커스 설정
  useEffect(() => {
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // shouldFocus prop에 따른 포커스 관리: 이미 포커스된 경우 재설정 방지
  useEffect(() => {
    if (
      shouldFocus &&
      textareaRef.current &&
      document.activeElement !== textareaRef.current
    ) {
      // 드로어 애니메이션(300ms) 후 포커스 설정
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldFocus]);

  // 키보드 등장/사라짐 처리: 뷰포트 변경 시 입력 박스 위치 조정
  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) {
        textareaRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      user?.preferences.enterToSend &&
      e.key === "Enter" &&
      !e.shiftKey &&
      !isComposing
    ) {
      e.preventDefault();
      handleSend();
    } else if (
      !user?.preferences.enterToSend &&
      e.key === "Enter" &&
      e.shiftKey &&
      !isComposing
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

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
      <div className="absolute bottom-0 left-4 right-4 flex items-center justify-between">
        <div>
          {usageLimit && (
            <UsageLimitNotice
              dailyRemaining={usageLimit.dailyRemaining}
              dailyResetAt={usageLimit.dailyResetAt}
              minuteRemaining={usageLimit.minuteRemaining}
              minuteResetAt={usageLimit.minuteResetAt}
              themeColor={user.preferences.themeColor}
            />
          )}
        </div>
        <button
          onClick={handleSend}
          className="group p-2 rounded-md"
          aria-label="Send message"
          disabled={isSendDisabled}
          style={{
            ["--theme-color" as any]: `rgb(${user.preferences.themeColor})`,
            cursor: isSendDisabled ? "not-allowed" : "pointer",
          }}
        >
          <div
            className={cn(
              "rounded-md p-2 transition-all",
              isSendDisabled
                ? "bg-gray-500 opacity-50"
                : "bg-[var(--theme-color)] opacity-100 group-hover:opacity-80 group-active:opacity-80"
            )}
          >
            <Send className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}

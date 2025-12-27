import { useUserPreference } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ModelSelect } from "./ModelSelect";
import { UsageLimitNotice } from "./UsageLimitNotice";

const placeholderMessages = [
  "What's on your mind?",
  "Wanna talk?",
  "Feel free to say anything",
  "I'm all ears!",
  "Say hi or just share a thought",
];

export function ChatInputBox({ chatId }: { chatId?: string }) {
  const enterToSend = useUserPreference("enterToSend");
  const themeColor = useUserPreference("themeColor");
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [randomPlaceholder, setRandomPlaceholder] = useState("");

  const isSendDisabled = false;
  // usageLimits
  //   .filter((x) => x.type === "message")
  //   .some((x) => x.remainingAmount <= 0);

  const inputBoxClass = cn(
    "relative max-w-screen-lg w-full px-4 py-3 border rounded-xl bg-white",
    "transition-all",
  );

  useEffect(() => {
    if (chatId) {
      const timer = setTimeout(() => {
        setShouldFocusInput(true);
        const resetTimer = setTimeout(() => setShouldFocusInput(false), 500);
        return () => clearTimeout(resetTimer);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [chatId]);

  useEffect(() => {
    // NOTE: Use Promise to avoid client/server hydration mismatch.
    Promise.try(() =>
      setRandomPlaceholder(
        placeholderMessages[
          Math.floor(Math.random() * placeholderMessages.length)
        ],
      ),
    );
  }, [setRandomPlaceholder]);

  useEffect(() => {
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (
      shouldFocusInput &&
      textareaRef.current &&
      document.activeElement !== textareaRef.current
    ) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldFocusInput]);

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

  if (!randomPlaceholder) {
    return null;
  }

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
        className="mb-5 max-h-[40vh] w-full resize-none bg-transparent text-[16px] focus:outline-none"
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />
      <div className="absolute right-4 bottom-0 left-4 flex items-center justify-between">
        <UsageLimitNotice />
        <button
          onClick={handleSend}
          className="group rounded-md p-2"
          aria-label="Send message"
          disabled={isSendDisabled}
          style={{
            ["--theme-color" as any]: `rgb(${themeColor})`,
            cursor: isSendDisabled ? "not-allowed" : "pointer",
          }}
        >
          <div
            className={cn(
              "rounded-md p-2 transition-all",
              isSendDisabled
                ? "bg-gray-500 opacity-50"
                : "bg-[var(--theme-color)] opacity-100 group-hover:opacity-80 group-active:opacity-80",
            )}
          >
            <Send className="h-4 w-4 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}

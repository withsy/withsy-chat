import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ModelSelect } from "./ModelSelect";

type Props = {
  onSendMessage: (message: string) => void;
};

export function ChatInputBox({ onSendMessage }: Props) {
  const { userPrefs } = useUser();
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const enterToSend = userPrefs["enterToSend"];

  const inputBoxClass = cn(
    "relative max-w-screen-md w-full px-4 py-3 border rounded-xl bg-white",
    "transition-all"
  );

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
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="w-full resize-none text-[16px] focus:outline-none bg-transparent mb-5 max-h-[40vh]"
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-end">
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

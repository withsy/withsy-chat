import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

type Props = {
  onSendMessage: (message: string) => void;
};

export function ChatInputBox({ onSendMessage }: Props) {
  const { userPrefs, setUserPrefAndSave, userPrefLoadings } = useSidebar();
  const [message, setMessage] = useState("");

  const enterToSend = userPrefs["enterToSend"];
  const isLoading = userPrefLoadings["enterToSend"];

  const inputBoxClass = cn(
    "relative w-full px-4 py-3 border rounded-xl bg-white",
    "transition-all"
  );

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterToSend && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (!enterToSend && e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={inputBoxClass}>
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="w-full resize-none focus:outline-none bg-transparent pb-10 max-h-[40vh]"
      />

      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            id="enter-toggle"
            checked={enterToSend}
            onCheckedChange={(v) => setUserPrefAndSave("enterToSend", v)}
            disabled={isLoading}
          />
          <Label htmlFor="enter-toggle">
            {enterToSend ? (
              <>
                <KeyCap>↩︎</KeyCap>
                <span className="text-xs text-gray-500">send</span>
                <KeyCap>⇧↩︎</KeyCap>
                <span className="text-xs text-gray-500">new line</span>
              </>
            ) : (
              <>
                <KeyCap>⇧↩︎</KeyCap>
                <span className="text-xs text-gray-500">send</span>
                <KeyCap>↩︎</KeyCap>
                <span className="text-xs text-gray-500">new line</span>
              </>
            )}
          </Label>
        </div>
        <button
          onClick={handleSend}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-1 py-0.5 bg-gray-100 rounded border text-xs mx-1">
      {children}
    </span>
  );
}

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import type { ChatModel } from "@/types/chat";
import { ModelSelect } from "./ModelSelect";

type Props = {
  onSendMessage: (message: string) => void;
  selectedModel: ChatModel;
  onChangeModel: (model: ChatModel) => void;
};

export function ChatInputBox({
  onSendMessage,
  selectedModel,
  onChangeModel,
}: Props) {
  const { userPrefs, setUserPrefsAndSave, userPrefLoadings } = useUser();
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const enterToSend = userPrefs["enterToSend"];
  const isLoading = userPrefLoadings["enterToSend"];

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

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };
  return (
    <div className={inputBoxClass}>
      <div className="mb-3">
        <ModelSelect value={selectedModel} onChange={onChangeModel} />
      </div>
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="w-full resize-none text-[16px] focus:outline-none bg-transparent mb-10 max-h-[40vh]"
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            id="enter-toggle"
            checked={enterToSend ?? false}
            onCheckedChange={(v) => setUserPrefsAndSave({ enterToSend: v })}
            disabled={isLoading}
            style={{
              backgroundColor: enterToSend
                ? `rgb(${userPrefs.themeColor})`
                : undefined,
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="enter-toggle" className="cursor-help">
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
              </TooltipTrigger>
              <TooltipContent side="top">
                {enterToSend
                  ? "Press Enter to send message, Shift + Enter for a new line"
                  : "Press Shift + Enter to send message, Enter for a new line"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

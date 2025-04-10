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

  const inputBoxClass = cn(
    "relative w-full px-4 py-3 border rounded-xl bg-white",
    "transition-all"
  );

  const onClick = () => {
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage("");
  };

  return (
    <div className={inputBoxClass}>
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="w-full resize-none focus:outline-none bg-transparent pb-10 max-h-[40vh]"
      />

      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="enter-toggle"
            checked={userPrefs["enterToSend"]}
            onCheckedChange={(v) => setUserPrefAndSave("enterToSend", v)}
            disabled={userPrefLoadings["enterToSend"]}
          />
          <Label htmlFor="enter-toggle" className="text-muted-foreground">
            Enter to send
          </Label>
        </div>
        <button onClick={onClick} className="p-2 rounded-md hover:bg-gray-100">
          <Send className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

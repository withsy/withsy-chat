import { useState } from "react";
import { Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/context/SidebarContext";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";

export function ChatInputBox() {
  const { isMobile, collapsed } = useSidebar();

  // user preference for enter to send
  const [enterToSend, setEnterToSend] = useState(true);
  const [message, setMessage] = useState("");

  const inputBoxClass = cn(
    "fixed bottom-[5vh] w-full px-4 py-3 shadow-md rounded-xl bg-white z-5  md:max-w-[calc((100vw-240px)*0.8)]",
    !collapsed && !isMobile ? "" : "max-w-[80vw] left-1/2 -translate-x-1/2"
  );
  return (
    <div className={inputBoxClass}>
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="w-full resize-none focus:outline-none bg-transparent pb-10 text-sm max-h-[40vh]"
      />

      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="enter-toggle"
            checked={enterToSend}
            onCheckedChange={setEnterToSend}
          />
          <Label
            htmlFor="enter-toggle"
            className="text-xs text-muted-foreground"
          >
            Enter to send
          </Label>
        </div>

        <button className="p-2 rounded-md hover:bg-gray-100">
          <Send className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

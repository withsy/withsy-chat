import { useState } from "react";
import { Mic, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import TextareaAutosize from "react-textarea-autosize";

export function ChatInputBox() {
  const [enterToSend, setEnterToSend] = useState(true);
  const [message, setMessage] = useState("");

  return (
    <div className="w-full max-w-4xl px-4 py-3 shadow-md rounded-xl bg-white relative">
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="w-full resize-none focus:outline-none bg-transparent pr-20 text-sm max-h-[40vh] pb-10"
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

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Send className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Mic className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

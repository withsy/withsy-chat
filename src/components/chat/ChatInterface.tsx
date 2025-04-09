import { ReactNode } from "react";
import { ChatInputBox } from "./ChatInputBox";

interface ChatInterfaceProps {
  children: ReactNode;
}

export default function ChatInterface({ children }: ChatInterfaceProps) {
  return (
    <div className="overflow-auto flex flex-col items-center">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        {children}
      </div>
      <ChatInputBox />
    </div>
  );
}

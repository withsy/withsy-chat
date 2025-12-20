import type { ReactNode } from "react";

interface ChatInterfaceProps {
  children: ReactNode;
}

export default function ChatInterface({ children }: ChatInterfaceProps) {
  return (
    <div className="flex flex-col items-center overflow-auto">
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        {children}
      </div>
      {/* <ChatInputBox /> */}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SquareMenu, SquarePen } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex h-[80vh] w-full max-w-xl flex-col p-0">
        <DialogHeader className="border-b p-4">
          <VisuallyHidden>
            <DialogTitle>Search Chats</DialogTitle>
          </VisuallyHidden>
          <Input
            placeholder="Search chats..."
            className="w-full border-none shadow-none focus:border-transparent focus:outline-none focus-visible:ring-0"
          />
        </DialogHeader>

        <div className="mb-2 h-0 flex-1 overflow-y-auto px-4 pb-4">
          <ChatItem
            href="/chat"
            title="Start a new chat"
            icon={<SquarePen size={16} />}
          />

          <Section label="Yesterday">
            <ChatItem
              href="/chat/chat-002"
              title="How are you?"
              icon={<SquareMenu size={16} />}
            />
            <ChatItem
              href="/chat/chat-001"
              title="Hello"
              icon={<SquareMenu size={16} />}
            />
          </Section>

          <Section label="Previous 7 Days">
            {Array(15)
              .fill(0)
              .map((_, i) => (
                <ChatItem
                  key={i}
                  href={`/chat/chat-${i}`}
                  title="Test?"
                  icon={<SquareMenu size={16} />}
                />
              ))}
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <Badge variant="outline" className="mb-2">
        {label}
      </Badge>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function ChatItem({
  icon,
  title,
  href,
}: {
  icon: ReactNode;
  title: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-gray-200 active:bg-gray-200">
        {icon}
        <span>{title}</span>
      </div>
    </Link>
  );
}

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { isMobile } = useSidebar();
  const mobile = isMobile ? "h-full" : "h-[50vh]";
  const className = `w-full max-w-xl p-2 rounded-xl overflow-hidden ${mobile}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader className="px-4 pt-8 border-b">
          <div className="flex justify-center ">
            <Input
              placeholder="Search chats..."
              className="w-full border-0 ounded-none shadow-none focus:outline-none focus-visible:ring-[0pt] focus:border-transparent"
            />
          </div>
        </DialogHeader>
        <div className="px-4   overflow-y-auto flex-1">
          <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
            <MessageSquarePlus size={16} />
            <span className="text-sm font-medium">New chat</span>
          </div>

          <Section label="Yesterday">
            <ChatItem title="전자레인지 파스타 삶기" />
            <ChatItem title="컴포넌트 분리 1" />
            <ChatItem title="컴포넌트 분리 2" />
            <ChatItem title="컴포넌트 분리 3" />
            <ChatItem title="컴포넌트 분리 4" />
          </Section>

          <Section label="Previous 7 Days">
            <ChatItem title="동남아식 고등어 요리" />
            <ChatItem title="SidebarLinkGroup collapsed 처리" />
            <ChatItem title="사이드바 커밋 메시지" />
            <ChatItem title="전자레인지 파스타 삶기" />
            <ChatItem title="컴포넌트 분리 1" />
            <ChatItem title="컴포넌트 분리 2" />
            <ChatItem title="컴포넌트 분리 3" />
            <ChatItem title="컴포넌트 분리 4" />
            <ChatItem title="전자레인지 파스타 삶기" />
            <ChatItem title="컴포넌트 분리 1" />
            <ChatItem title="컴포넌트 분리 2" />
            <ChatItem title="컴포넌트 분리 3" />
            <ChatItem title="컴포넌트 분리 4" />
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
      <Badge variant="outline" className="text-xs mb-2">
        {label}
      </Badge>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function ChatItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
      <MessagesSquare size={16} />
      <span className="text-sm">{title}</span>
    </div>
  );
}

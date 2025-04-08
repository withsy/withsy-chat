import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tag, MessageSquare, Cpu, Settings, LucideIcon } from "lucide-react";

interface UserMenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

function UserMenuItem({ icon: Icon, label, onClick }: UserMenuItemProps) {
  return (
    <DropdownMenuItem onSelect={onClick}>
      <Icon className="mr-2 h-4 w-4 text-black" />
      {label}
    </DropdownMenuItem>
  );
}

export default function Header() {
  return (
    <header className="h-[60px] flex items-center bg-white border-b justify-between px-4">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/thumbs/svg?seed=Yejin`}
            />
            <AvatarFallback>YJ</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 mt-2">
          <UserMenuItem icon={Tag} label="Tags" />
          <UserMenuItem icon={MessageSquare} label="Prompts" />
          <UserMenuItem icon={Cpu} label="Models" />
          <DropdownMenuSeparator />
          <UserMenuItem icon={Settings} label="Settings" />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

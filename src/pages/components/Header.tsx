import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Tag, MessageSquare, Cpu, Settings, LucideIcon } from "lucide-react";
import { useState } from "react";

interface ToggleMenuItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleMenuItem({ id, label, checked, onChange }: ToggleMenuItemProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

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
  const [tabEnabled, setTabEnabled] = useState(true);
  const [indexVisible, setIndexVisible] = useState(true);
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
          <ToggleMenuItem
            id="tab-toggle"
            label="Enable Tabs"
            checked={tabEnabled}
            onChange={setTabEnabled}
          />

          <ToggleMenuItem
            id="index-toggle"
            label="Show Index"
            checked={indexVisible}
            onChange={setIndexVisible}
          />

          <DropdownMenuSeparator />
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

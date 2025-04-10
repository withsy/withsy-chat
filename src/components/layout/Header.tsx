import UserDropdownMenu from "../UserDropdownMenu";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

function ArchiveButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="foreground hover:text-blue-500 hover:bg-blue-50 rounded-md "
    >
      <Archive className="w-4 h-4" />
    </Button>
  );
}
export default function Header() {
  return (
    <header className="h-[60px] flex items-center justify-between px-4">
      <div />
      <div className="flex items-center gap-4">
        <ArchiveButton />
        <UserDropdownMenu />
      </div>
    </header>
  );
}

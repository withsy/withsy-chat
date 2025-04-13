import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import UserDropdownMenu from "../UserDropdownMenu";

function ArchiveButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <Archive className="h-4 w-4" />
    </Button>
  );
}

export default function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-4 py-1">
      <div className="flex items-center ml-auto gap-2">
        <UserDropdownMenu />
      </div>
    </header>
  );
}

import { useSession } from "next-auth/react";
import LoginButton from "../login/LoginButton";
import UserDropdownMenu from "../UserDropdownMenu";
import { HeaderTooltipGroup } from "./HeaderTooltip";

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="flex items-center justify-between h-16 px-4 py-1 z-150">
      <HeaderTooltipGroup />
      <div className="flex items-center ml-auto gap-4">
        {!session ? <LoginButton /> : <UserDropdownMenu />}
      </div>
    </header>
  );
}

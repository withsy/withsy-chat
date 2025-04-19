import { useUser } from "@/context/UserContext";
import LoginButton from "../login/LoginButton";
import UserDropdownMenu from "../UserDropdownMenu";
import { HeaderTooltipGroup } from "./HeaderTooltip";

export default function Header() {
  const { userSession } = useUser();
  return (
    <header className="flex items-center justify-between h-16 px-4 py-1 z-40">
      <HeaderTooltipGroup />
      <div className="flex items-center ml-auto gap-4">
        {!userSession ? <LoginButton /> : <UserDropdownMenu />}
      </div>
    </header>
  );
}

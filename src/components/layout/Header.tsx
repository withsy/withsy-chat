import LoginButton from "../login/LoginButton";
import UserDropdownMenu from "../UserDropdownMenu";
import { HeaderTooltipGroup } from "./HeaderTooltip";

export default function Header() {
  // TODO: LoginButton refactoring.
  return (
    <header className="flex items-center justify-between h-16 px-4 py-1 z-150">
      <LoginButton />
      <HeaderTooltipGroup />
      <div className="flex items-center ml-auto gap-2">
        <UserDropdownMenu />
      </div>
    </header>
  );
}

import { useUser } from "@/context/UserContext";
import LoginButton from "../login/LoginButton";
import { HeaderTooltipGroup } from "./HeaderTooltip";

export default function Header() {
  const { userSession } = useUser();
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 py-1">
      <HeaderTooltipGroup />
      <div className="flex items-center ml-auto">
        {!userSession && <LoginButton />}
      </div>
    </header>
  );
}

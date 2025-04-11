import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import UserDropdownMenu from "../UserDropdownMenu";

type MainProps = {
  children: ReactNode;
};

export default function Main({ children }: MainProps) {
  const { collapsed, isMobile, userPrefs } = useSidebar();
  const { wideView, largeText } = userPrefs;

  const sidebarWidth = !collapsed && !isMobile ? 240 : 0;
  const shouldHideDropdown = isMobile && !collapsed;

  return (
    <div
      className="flex flex-col flex-1 transition-all duration-300 relative"
      style={{ marginLeft: sidebarWidth }}
    >
      <div
        className={cn(
          "fixed top-4 right-6 z-50",
          shouldHideDropdown && "hidden"
        )}
      >
        <UserDropdownMenu />
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 py-4 mt-8 transition-all",
          "w-full",
          !wideView && "md:w-[80%] md:mx-auto",
          largeText ? "text-lg" : "text-base"
        )}
      >
        {children}
      </div>
    </div>
  );
}
